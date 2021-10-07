// SPDX-License-Identifier: GPL-3.0-or-Collateral
/* solhint-disable space-after-comma */
pragma solidity 0.8.0;

import "./interfaces/IConditionalTokens.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Receiver.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "./SolutionsHub.sol";
import "./SolverLib.sol";
import "hardhat/console.sol";

abstract contract Solver is Initializable, ERC1155Receiver {
    SolverLib.Multihash public uiURI; // Resource for Solver Front End

    SolverLib.Config public config; // Primary config of the Solver
    SolverLib.Condition[] public conditions; // Array of conditions
    address public chainParent; // Parent solver
    address public chainChild; // Child solver
    uint256 public chainIndex; // This Solver's index in chain
    uint256 public timelock; // Current timelock
    bytes32 public trackingId; // Settable for adding some higher-level trackingId (eg. id of a proposal this solver belongs to)

    SolverLib.Callbacks callbacks;
    SolverLib.Datas datas;

    event DeployedChild(address chainChild);
    event PreparedSolve(address solver, uint256 solveIndex);

    function init(
        address _chainParent,
        uint256 _chainIndex,
        SolverLib.Config calldata _solverConfig
    ) external initializer {
        require(
            msg.sender == address(0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512), // FACTORY DEV ADDRESS
            "Only factory"
        );
        require(_solverConfig.keeper != address(0), "Keeper invalid");
        chainParent = _chainParent;
        chainIndex = _chainIndex;
        config = _solverConfig;
    }

    // ********************************************************************************** //
    // ********************************** SETUP ***************************************** //
    // ********************************************************************************** //

    function prepareSolve(uint256 _index) external {
        require(
            msg.sender == config.keeper || msg.sender == chainParent,
            "Only keeper/parent"
        );
        require(_index == conditions.length, "Invalid index to prepare");
        require(callbacks.numOutgoing == 0, "Fulfill outgoing callbacks first");
        require(callbacks.numIncoming == 0, "Fulfill incoming callbacks first");

        conditions.push(
            SolverLib.createCondition(
                config.conditionBase,
                chainParent,
                address(this),
                conditions.length
            )
        );

        executeIngests();

        emit PreparedSolve(address(this), _index);

        if (chainChild != address(0)) {
            Solver(chainChild).prepareSolve(_index);
        }
    }

    function deployChild(SolverLib.Config calldata _config)
        public
        returns (Solver _solver)
    {
        require(msg.sender == config.keeper, "Only keeper");
        require(chainChild == address(0), "Solver has child");

        (chainChild, _solver) = SolverLib.deployChild(
            _config,
            address(this),
            chainIndex
        );

        emit DeployedChild(chainChild);
    }

    // ********************************************************************************** //
    // ****************************** EXECUTION ***************************************** //
    // ********************************************************************************** //

    function executeSolve(uint256 _index) public {
        require(
            conditions[_index].status == SolverLib.Status.Initiated,
            "not Initiated"
        );
        require(ingestsValid() == true, "ingests invalid");

        conditions[_index].status = SolverLib.Status.Executed;

        SolverLib.splitPosition(
            chainParent,
            config.conditionBase,
            conditions[_index],
            abi.decode(datas.slots[config.conditionBase.amountSlot], (uint256))
        );
        SolverLib.allocatePartition(
            conditions[_index],
            config.conditionBase,
            address(this),
            datas,
            trackingId
        );

        postroll(_index);
        cascade(_index);
    }

    function postroll(uint256 _index) internal virtual;

    function cascade(uint256 _index) internal {
        if (chainChild != address(0) && Solver(chainChild).ingestsValid()) {
            Solver(chainChild).executeSolve(_index);
        }
    }

    // ********************************************************************************** //
    // ********************************** DATA ****************************************** //
    // ********************************************************************************** //

    function router(uint256 _slot, bytes memory _data) private {
        require(
            datas.slotVersions[_slot] == (conditions.length - 1),
            "Slot version invalid"
        );
        datas.slotVersions[_slot]++;
        datas.slots[_slot] = _data;

        callback(_slot);
    }

    function executeIngests() private {
        for (uint256 i; i < config.ingests.length; i++) {
            if (config.ingests[i].ingestType != SolverLib.IngestType.Callback) {
                ingest(config.ingests[i]);
            } else {
                address _cbSolver = Solver(address(this)).addressFromChainIndex(
                    config.ingests[i].solverIndex
                );
                registerIncomingCallback(_cbSolver, i);
                Solver(_cbSolver).registerOutgoingCallback(
                    abi.decode(config.ingests[i].data, (uint256)),
                    chainIndex
                );
            }
        }
    }

    function ingest(SolverLib.Ingest storage _ingest) private {
        router(_ingest.slot, SolverLib.ingest(_ingest));
    }

    function ingestsValid() public view returns (bool) {
        return SolverLib.ingestsValid(config.ingests, conditions.length);
    }

    function addData(uint256 _slot, bytes memory _data) external {
        require(msg.sender == config.keeper, "OnlyKeeper");
        router(_slot, _data);
    }

    function getData(uint256 _slot) public view returns (bytes memory data) {
        data = datas.slots[_slot];
    }

    // ********************************************************************************** //
    // ****************************** CALLBACKS ***************************************** //
    // ********************************************************************************** //
    function registerIncomingCallback(address _cbSolver, uint256 _ingestIndex)
        private
    {
        callbacks.incoming[
            keccak256(
                abi.encodePacked(
                    _cbSolver,
                    abi.decode(config.ingests[_ingestIndex].data, (uint256))
                )
            )
        ] = _ingestIndex;
        callbacks.numIncoming++;
    }

    function registerOutgoingCallback(uint256 _slot, uint256 _chainIndex)
        external
    {
        require(
            msg.sender == addressFromChainIndex(_chainIndex),
            "msg.sender not solver"
        );
        callbacks.outgoing[_slot].push(msg.sender);
        callbacks.numOutgoing++;
    }

    function handleCallback(uint256 _slot) external {
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
            Solver(msg.sender).getCallbackOutput(
                abi.decode(
                    config.ingests[callbacks.incoming[_cb]].data,
                    (uint256)
                )
            )
        );
        delete callbacks.incoming[_cb];
        callbacks.numIncoming--;
    }

    function callback(uint256 _slot) private {
        for (uint256 i; i < callbacks.outgoing[_slot].length; i++) {
            if (address(callbacks.outgoing[_slot][i]) != address(0)) {
                Solver(address(callbacks.outgoing[_slot][i])).handleCallback(
                    _slot
                );
                delete callbacks.outgoing[_slot][i];
                callbacks.numOutgoing--;
            }
        }
    }

    function getCallbackOutput(uint256 _slot)
        public
        view
        returns (bytes memory data)
    {
        require(
            datas.slotVersions[_slot] == conditions.length,
            "Slot invalid ver."
        );

        data = datas.slots[_slot];
    }

    function getOutgoingCallbacks(uint256 slot)
        public
        view
        returns (address[] memory)
    {
        return callbacks.outgoing[slot];
    }

    // ********************************************************************************** //
    // ****************************** REPORTING ***************************************** //
    // ********************************************************************************** //

    function proposePayouts(uint256 _index, uint256[] calldata _payouts)
        external
    {
        require(msg.sender == config.keeper, "Only Keeper");
        require(
            conditions[_index].status == SolverLib.Status.Executed,
            "Condition not Executed"
        );

        SolverLib.proposePayouts(conditions[_index], _payouts);
        updateTimelock();
    }

    function confirmPayouts(uint256 _index) external {
        require(block.timestamp > timelock, "Timelock still locked");
        require(
            conditions[_index].status == SolverLib.Status.OutcomeProposed,
            "Outcome not proposed"
        );
        SolverLib.confirmPayouts(conditions[_index]);
    }

    // ********************************************************************************** //
    // ***************************** ARBITRATION **************************************** //
    // ********************************************************************************** //

    function arbitrate(uint256 _index, uint256[] memory payouts) external {
        require(msg.sender == config.arbitrator, "Only arbitrator");
        require(
            conditions[_index].status == SolverLib.Status.ArbitrationPending,
            "Not ArbitrationPending"
        );
        require(block.timestamp > timelock, "Timelock still locked");
        SolverLib.arbitrate(conditions[_index], payouts);
    }

    function arbitrateNull(uint256 _index) external {
        require(msg.sender == config.arbitrator, "Only arbitrator");
        require(
            conditions[_index].status == SolverLib.Status.ArbitrationPending,
            "Not ArbitrationPending"
        );
        SolverLib.arbitrateNull(conditions[_index]);
        updateTimelock();
    }

    function arbitrationRequested(uint256 _index) external {
        require(msg.sender == config.arbitrator, "Only arbitrator");
        require(
            conditions[_index].status == SolverLib.Status.OutcomeProposed,
            "Not OutcomeProposed"
        );

        SolverLib.arbitrationRequested(conditions[_index]);
        updateTimelock();
    }

    function arbitrationPending(uint256 _index) external {
        require(msg.sender == config.arbitrator, "Only arbitrator");
        require(
            conditions[_index].status == SolverLib.Status.ArbitrationRequested,
            "Not ArbitrationRequested"
        );
        SolverLib.arbitrationPending(conditions[_index]);
        updateTimelock();
    }

    // ********************************************************************************** //
    // ******************************** UTILIY ****************************************** //
    // ********************************************************************************** //

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

    function getConditions()
        public
        view
        returns (SolverLib.Condition[] memory)
    {
        return conditions;
    }

    function setTrackingId(bytes32 _trackingId) public {
        require(trackingId == bytes32(0), "TrackingId set");
        trackingId = _trackingId;
    }

    function updateTimelock() internal {
        timelock = block.timestamp + (config.timelockSeconds * 1 seconds);
    }

    function percentage(
        uint256 x,
        uint256 y,
        uint128 scale
    ) public pure returns (uint256) {
        return
            SolverLib.mulScale(y, 100, scale) /
            SolverLib.mulScale(x, 100, scale);
    }

    // ********************************************************************************** //
    // ******************************** TOKENS ****************************************** //
    // ********************************************************************************** //

    function redeemPosition(
        IERC20 _collateralToken,
        bytes32 _parentCollectionId,
        bytes32 _conditionId,
        uint256[] calldata _indexSets
    ) external {
        require(msg.sender == config.keeper, "Only Keeper");
        IConditionalTokens(0x5FbDB2315678afecb367f032d93F642f64180aa3)
            .redeemPositions(
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
