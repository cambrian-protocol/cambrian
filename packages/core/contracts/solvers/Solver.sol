// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Receiver.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import "../interfaces/IConditionalTokens.sol";
import "../interfaces/ISolver.sol";

import "./Solver.sol";
import "./SolverLib.sol";

abstract contract Solver is Initializable, ERC1155Receiver {
    address factoryAddress; // Factory which creates Solver proxies
    address ctfAddress; // Conditional token framework
    address deployerAddress; // Address which called SolverFactory to deploy this Solver

    SolverLib.Config public config; // Primary config of the Solver
    SolverLib.Condition[] public conditions; // Array of conditions

    address public chainParent; // Parent solver
    address public chainChild; // Child solver
    uint256 public chainIndex; // This Solver's index in chain

    uint256[] public timelocks; // Current timelock, indexed by condition
    bytes32 public trackingId; // Settable for adding some higher-level trackingId (eg. id of a proposal this solver belongs to)

    SolverLib.Callbacks callbacks;
    SolverLib.Datas datas;

    event ChangedStatus(bytes32 conditionId);

    event DeployedChild(address child);

    event DeliveredNullArbitration(bytes32 conditionId);

    event IngestedData(); // Emited on executeIngests(), handleCallback(), addData()

    event PreparedSolve(address solver, uint256 solveIndex);

    // Recommended disabling of initializer for the implementation. Not called by clones
    constructor() {
        _disableInitializers();
    }

    /**
        @dev Called by SolverFactory when contract is created. Nothing else should ever need to call this
        @param _chainParent The address of the Solver above this one in the chain. address(0) if this Solver is first.
        @param _chainIndex The index of this Solver in the chain
        @param _solverConfig The configuration of this Solver
    */
    function init(
        address _deployer,
        address _ctfAddress,
        address _chainParent,
        uint256 _chainIndex,
        SolverLib.Config calldata _solverConfig
    ) external initializer {
        require(_solverConfig.keeper != address(0), "Keeper invalid");
        deployerAddress = _deployer;
        factoryAddress = msg.sender;
        ctfAddress = _ctfAddress;
        chainParent = _chainParent;
        chainIndex = _chainIndex;
        config = _solverConfig;

        for (uint256 i = 0; i < _solverConfig.ingests.length; i++) {
            datas.slotIngestIdx[_solverConfig.ingests[i].slot] = i;
        }
    }

    // ********************************************************************************** //
    // ********************************** SETUP ***************************************** //
    // ********************************************************************************** //

    /**
        @dev Creates a new condition, associated timelock, and executes ingests for this Solver and any child Solvers
        @param _index Index of the new condition to be created.
    */
    function prepareSolve(uint256 _index) external {
        if (conditions.length > 0) {
            require(
                msg.sender == config.keeper || msg.sender == chainParent,
                "Only keeper/parent"
            );
        }

        require(_index == conditions.length, "Invalid index to prepare");
        require(callbacks.numOutgoing == 0, "Fulfill outgoing callbacks first");
        require(callbacks.numIncoming == 0, "Fulfill incoming callbacks first");

        conditions.push(
            SolverLib.createCondition(
                ctfAddress,
                config.conditionBase,
                chainParent,
                conditions.length
            )
        );
        timelocks.push(0);

        executeIngests();

        emit PreparedSolve(address(this), _index);

        if (chainChild != address(0)) {
            ISolver(chainChild).prepareSolve(_index);
        }
    }

    /**
        @dev Deploys a new Solver as a child
        @param _config Configuration of the child Solver
    */
    function deployChild(SolverLib.Config calldata _config)
        public
        returns (address)
    {
        require(msg.sender == config.keeper, "Only keeper");
        require(chainChild == address(0), "Solver has child");

        chainChild = SolverLib.deployChild(
            factoryAddress,
            _config,
            chainIndex,
            trackingId
        );

        return chainChild;
    }

    // ********************************************************************************** //
    // ****************************** EXECUTION ***************************************** //
    // ********************************************************************************** //

    /**
        @dev Mints conditional tokens, allocates them to recipients specified by ingested data, runs arbitrary `postroll()` function and tries to do the same for child Solver
        @param _index Index of condition to execute on
     */
    function executeSolve(uint256 _index) public {
        require(ingestsValid() == true, "ingests invalid");

        SolverLib.executeSolve(
            _index,
            ctfAddress,
            conditions[_index],
            config.conditionBase,
            datas,
            trackingId,
            chainParent,
            abi.decode(
                datas.slots[config.conditionBase.amountSlot][_index],
                (uint256)
            )
        );

        postroll(_index);
        cascade(_index);
    }

    function postroll(uint256 _index) internal virtual;

    function cascade(uint256 _index) internal {
        if (
            chainChild != address(0) &&
            ISolver(chainChild).ingestsValid() &&
            ISolver(chainChild).allocationsValid(_index)
        ) {
            ISolver(chainChild).executeSolve(_index);
        }
    }

    // ********************************************************************************** //
    // ********************************** DATA ****************************************** //
    // ********************************************************************************** //

    /**
        @dev Adds data to slot (if valid ver.) and executes any callbacks for this slot
        @param _slot Destination slot
        @param _data Data added to slot
     */
    function router(bytes32 _slot, bytes memory _data) private {
        require(
            datas.slots[_slot].length == (conditions.length - 1),
            "Slot version invalid"
        );
        datas.slots[_slot].push(_data);

        callback(_slot);
    }

    /**
        @dev Executes ingests from config. Registers callbacks for ingests which wait for upstream solver data
     */
    function executeIngests() private {
        for (uint256 i; i < config.ingests.length; i++) {
            if (config.ingests[i].ingestType != SolverLib.IngestType.Callback) {
                ingest(config.ingests[i]);
            } else {
                address _cbSolver = ISolver(address(this))
                    .addressFromChainIndex(config.ingests[i].solverIndex);
                registerIncomingCallback(_cbSolver, i);
                ISolver(_cbSolver).registerOutgoingCallback(
                    abi.decode(config.ingests[i].data, (bytes32)),
                    chainIndex
                );
            }
        }
        emit IngestedData();
    }

    function ingest(SolverLib.Ingest storage _ingest) private {
        require(uint256(_ingest.ingestType) <= 3, "Invalid ingestType");
        _ingest.executions++;

        if (_ingest.ingestType != SolverLib.IngestType.Manual) {
            router(_ingest.slot, SolverLib.ingest(_ingest));
        }
    }

    /**
        @dev Verifies that all ingests have been performed for a condition
     */
    function ingestsValid() public view returns (bool) {
        return SolverLib.ingestsValid(config.ingests, conditions.length);
    }

    /**
        @dev Verifies that all slots corresponding to recipients have been filled before CT allocation
     */
    function allocationsValid(uint256 _index) public view returns (bool) {
        return SolverLib.allocationsValid(_index, datas, config.conditionBase);
    }

    /**
        @dev Allows keeper to manually add data to IngestType.Manual slots after executeIngests
        @param _slot Destination slot
        @param _data Data to be added
     */
    function addData(bytes32 _slot, bytes memory _data) external {
        require(msg.sender == config.keeper, "OnlyKeeper");
        require(
            config.ingests[datas.slotIngestIdx[_slot]].ingestType ==
                SolverLib.IngestType.Manual,
            "only IngestType.Manual"
        );

        router(_slot, _data);
        emit IngestedData();
    }

    function getData(bytes32 _slot) public view returns (bytes memory data) {
        data = datas.slots[_slot][datas.slots[_slot].length - 1];
    }

    function getAllData(bytes32 _slot)
        public
        view
        returns (bytes[] memory data)
    {
        data = datas.slots[_slot];
    }

    // ********************************************************************************** //
    // ****************************** CALLBACKS ***************************************** //
    // ********************************************************************************** //

    /**
        @dev Register callback that an upstream Solver will call when some data is added
        @param _cbSolver Address of the Solver making the callback
        @param _ingestIndex Index of the ingest registering this callback
     */
    function registerIncomingCallback(address _cbSolver, uint256 _ingestIndex)
        private
    {
        callbacks.incoming[
            keccak256(
                abi.encodePacked(
                    _cbSolver,
                    abi.decode(config.ingests[_ingestIndex].data, (bytes32))
                )
            )
        ] = _ingestIndex;
        callbacks.numIncoming++;
    }

    /**
        @dev Register callback expected by a downstream Solver for some data
        @param _slot Slot being waited on by downstream Solver
        @param _chainIndex Index of the Solver requesting this callback
     */
    function registerOutgoingCallback(bytes32 _slot, uint256 _chainIndex)
        external
    {
        require(
            msg.sender == addressFromChainIndex(_chainIndex),
            "msg.sender not solver"
        );

        if (
            datas.slots[_slot].length > 0 &&
            datas.slots[_slot].length == conditions.length
        ) {
            // Downchain Solver is preparing a new condition before us and is happy with the existing data
            ISolver(msg.sender).handleCallback(_slot);
        } else {
            callbacks.outgoing[_slot].push(msg.sender);
            callbacks.numOutgoing++;
        }
    }

    /**
        @dev Handle upstream Solver making callback and ingest the data
        @param _slot Destination slot for the data being sent
     */
    function handleCallback(bytes32 _slot) external {
        bytes32 _cb = keccak256(abi.encodePacked(msg.sender, _slot));
        require(
            msg.sender ==
                addressFromChainIndex(
                    config.ingests[callbacks.incoming[_cb]].solverIndex
                ),
            "msg.sender not solver"
        );
        require(
            config.ingests[callbacks.incoming[_cb]].ingestType ==
                SolverLib.IngestType.Callback,
            "Ingest not Callback"
        );

        config.ingests[callbacks.incoming[_cb]].executions++;

        router(
            config.ingests[callbacks.incoming[_cb]].slot,
            ISolver(msg.sender).getCallbackOutput(
                abi.decode(
                    config.ingests[callbacks.incoming[_cb]].data,
                    (bytes32)
                )
            )
        );
        delete callbacks.incoming[_cb];
        callbacks.numIncoming--;

        emit IngestedData();
    }

    /**
        @dev Make any callbacks that were waiting on _slot
        @param _slot Slot being waited on by downstream Solvers
     */
    function callback(bytes32 _slot) private {
        for (uint256 i; i < callbacks.outgoing[_slot].length; i++) {
            if (address(callbacks.outgoing[_slot][i]) != address(0)) {
                ISolver(address(callbacks.outgoing[_slot][i])).handleCallback(
                    _slot
                );
                delete callbacks.outgoing[_slot][i];
                callbacks.numOutgoing--;
            }
        }
    }

    /**
        @dev A simple getter that requires upstream slot ver. == our condition ver.
        @param _slot Slot containing data
     */
    function getCallbackOutput(bytes32 _slot)
        public
        view
        returns (bytes memory data)
    {
        require(
            datas.slots[_slot].length == conditions.length,
            "Slot invalid ver."
        );

        data = datas.slots[_slot][datas.slots[_slot].length - 1];
    }

    function getOutgoingCallbacks(bytes32 slot)
        public
        view
        returns (address[] memory)
    {
        return callbacks.outgoing[slot];
    }

    // ********************************************************************************** //
    // ****************************** REPORTING ***************************************** //
    // ********************************************************************************** //

    /**
        @dev Propose payouts (AKA outcomes) for a condition
        @param _index Index of condition
        @param _payouts Array of uint256 values representing the ratio of the collateral that each outcome can claim. The length of this array must be equal to the outcomeSlotCount
     */
    function proposePayouts(uint256 _index, uint256[] calldata _payouts)
        external
    {
        require(msg.sender == config.keeper, "Only Keeper");
        require(
            _payouts.length == config.conditionBase.outcomeSlots,
            "payouts.length must match outcomeSlots"
        );
        require(
            conditions[_index].status == SolverLib.Status.Executed,
            "Condition not Executed"
        );

        SolverLib.proposePayouts(conditions[_index], _payouts);
        updateTimelock(_index);
    }

    /**
        @dev Confirm payouts for condition (reportPayouts to ConditionalTokens contract)
        @param _index Index of condition
     */
    function confirmPayouts(uint256 _index) external {
        require(block.timestamp > timelocks[_index], "Timelock still locked");
        require(
            conditions[_index].status == SolverLib.Status.OutcomeProposed,
            "Outcome not proposed"
        );
        SolverLib.confirmPayouts(ctfAddress, conditions[_index]);
    }

    // ********************************************************************************** //
    // ***************************** ARBITRATION **************************************** //
    // ********************************************************************************** //

    /**
        @dev Sets condition.status to ArbitrationRequested.
        @param _index Index of condition
     */
    function arbitrationRequested(uint256 _index) external {
        require(msg.sender == config.arbitrator, "Only arbitrator");
        require(
            conditions[_index].status == SolverLib.Status.OutcomeProposed ||
                conditions[_index].status ==
                SolverLib.Status.ArbitrationRequested,
            "Cannot request"
        );

        SolverLib.arbitrationRequested(conditions[_index]);
        updateTimelock(_index);
    }

    /**
        @dev Allows arbitrator to unilaterally make a payout report.
        @param _index Index of condition
        @param payouts Array of uint256 values representing the ratio of the collateral that each outcome can claim. The length of this array must be equal to the outcomeSlotCount
     */
    function arbitrate(uint256 _index, uint256[] memory payouts) external {
        require(msg.sender == config.arbitrator, "Only arbitrator");
        require(
            conditions[_index].status == SolverLib.Status.ArbitrationRequested,
            "Not ArbitrationRequested"
        );
        require(block.timestamp > timelocks[_index], "Timelock still locked");
        require(
            payouts.length == config.conditionBase.outcomeSlots,
            "payouts.length must match outcomeSlots"
        );
        SolverLib.arbitrate(ctfAddress, conditions[_index], payouts);
    }

    /**
        @dev Returns condition.status to OutcomeProposed without a ruling.
        @param _index Index of condition
     */
    function arbitrateNull(uint256 _index) external {
        require(msg.sender == config.arbitrator, "Only arbitrator");
        require(
            conditions[_index].status == SolverLib.Status.ArbitrationRequested,
            "Not ArbitrationRequested"
        );
        SolverLib.arbitrateNull(conditions[_index]);
        updateTimelock(_index);
    }

    // ********************************************************************************** //
    // ******************************** UTILIY ****************************************** //
    // ********************************************************************************** //

    /**
        @dev Get address for a Solver by its index in the chain
        @param _index Index of Solver
     */
    function addressFromChainIndex(uint256 _index)
        public
        view
        returns (address _address)
    {
        if (_index == chainIndex) {
            _address = address(this);
        } else if (_index < chainIndex) {
            _address = ISolver(chainParent).addressFromChainIndex(_index);
        } else if (_index > chainIndex) {
            _address = ISolver(chainChild).addressFromChainIndex(_index);
        }
    }

    function condition(uint256 index)
        public
        view
        returns (SolverLib.Condition memory)
    {
        return conditions[index];
    }

    function getConditions()
        public
        view
        returns (SolverLib.Condition[] memory)
    {
        return conditions;
    }

    function getConfig() public view returns (SolverLib.Config memory) {
        return config;
    }

    function keeper() public view returns (address) {
        return config.keeper;
    }

    function arbitrator() public view returns (address) {
        return config.arbitrator;
    }

    function setTrackingId(bytes32 _trackingId) public {
        require(trackingId == bytes32(0), "TrackingId set");
        require(msg.sender == deployerAddress);
        trackingId = _trackingId;
    }

    function updateTimelock(uint256 _index) internal {
        timelocks[_index] =
            block.timestamp +
            (config.timelockSeconds * 1 seconds);
    }

    function collateralBalance() public view returns (uint256 balance) {
        balance = IERC20(config.conditionBase.collateralToken).balanceOf(
            address(this)
        );
    }

    /**
     * @notice Returns recipient addresses for a condition
     */
    function isRecipient(address account, uint256 conditionIndex)
        public
        view
        returns (bool)
    {
        for (uint256 i; i < config.conditionBase.allocations.length; i++) {
            address recipient = abi.decode(
                datas.slots[
                    config.conditionBase.allocations[i].recipientAddressSlot
                ][conditionIndex],
                (address)
            );

            if (account == recipient) {
                return true;
            }
        }
        return false;
    }

    function getStatus(uint256 conditionIndex)
        public
        view
        returns (SolverLib.Status status)
    {
        status = conditions[conditionIndex].status;
    }

    // ********************************************************************************** //
    // ******************************** TOKENS ****************************************** //
    // ********************************************************************************** //

    /**
        @dev Redeems CTs held by this Solver. See ConditionalTokens contract for more info.
     */
    function redeemPosition(
        IERC20 _collateralToken,
        bytes32 _parentCollectionId,
        bytes32 _conditionId,
        uint256[] calldata _indexSets
    ) external {
        require(msg.sender == config.keeper, "Only Keeper");
        IConditionalTokens(ctfAddress).redeemPositions(
            _collateralToken,
            _parentCollectionId,
            _conditionId,
            _indexSets
        );
    }

    function onERC1155Received(
        address operator,
        address from,
        uint256 id,
        uint256 value,
        bytes calldata data
    ) external virtual override returns (bytes4) {
        return this.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(
        address operator,
        address from,
        uint256[] calldata ids,
        uint256[] calldata values,
        bytes calldata data
    ) external virtual override returns (bytes4) {
        return this.onERC1155BatchReceived.selector;
    }
}