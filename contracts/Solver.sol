// SPDX-License-Identifier: GPL-3.0-or-Collateral
/* solhint-disable space-after-comma */
pragma solidity 0.8.0;

import "./interfaces/IConditionalTokens.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Receiver.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "./SolutionsHub.sol";
import "./SolverLib.sol";

abstract contract Solver is Initializable, ERC1155Receiver {
    SolverLib.Config public config; // Primary config of the Solver
    SolverLib.Condition[] public conditions; // Array of conditions

    string UI_URI;
    bool hasCondition;
    address public chainParent; // Parent solver
    address public chainChild; // Child solver
    uint256 public chainIndex; // This Solver's index in chain
    uint256 public timelock; // Current timelock
    bytes32 public trackingId; // Settable for adding some higher-level trackingId (eg. id of a proposal this solver belongs to)

    mapping(uint256 => address[]) requestedCallbacks; // This Slot => chainIndex
    mapping(uint256 => uint256) expectedCallbacks; // Caller Slot => ingest index

    SolverLib.Datas datas;

    function init(
        address _chainParent,
        uint256 _chainIndex,
        SolverLib.Config calldata _solverConfig
    ) external {
        require(
            msg.sender == address(0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512), // FACTORY DEV ADDRESS
            "Only factory"
        );
        require(_solverConfig.keeper != address(0), "Keeper invalid");
        chainParent = _chainParent;
        chainIndex = _chainIndex;
        config = _solverConfig;
    }

    function prepareSolve() public {
        console.log("prepareSolve chainIndex: ", chainIndex);
        if (hasCondition) {
            require(
                msg.sender == config.keeper || msg.sender == chainParent,
                "Only keeper/parent"
            );
            require(
                conditions[conditions.length - 1].status ==
                    SolverLib.Status.ArbitrationDelivered ||
                    conditions[conditions.length - 1].status ==
                    SolverLib.Status.OutcomeReported,
                "Current solve active"
            );
        }
        hasCondition = true;
        addCondition();
        executeIngests();
        if (chainChild != address(0)) {
            Solver(chainChild).prepareSolve();
        }
    }

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

    function executeIngests() private {
        for (uint256 i; i < config.ingests.length; i++) {
            if (!config.ingests[i].isDeferred) {
                ingest(i);
            } else {
                expectedCallbacks[
                    abi.decode(config.ingests[i].data, (uint256))
                ] = i;

                Solver(addressFromChainIndex(config.ingests[i].solverIndex))
                    .registerCallback(
                        abi.decode(config.ingests[i].data, (uint256)),
                        chainIndex
                    );
            }
        }
    }

    function cascade() private {
        if (chainChild != address(0) && Solver(chainChild).ingestsValid()) {
            Solver(chainChild).executeSolve();
        }
    }

    function deployChild(SolverLib.Config calldata _config)
        public
        returns (Solver _solver)
    {
        require(chainChild == address(0), "Solver has child");

        (chainChild, _solver) = SolverLib.deployChild(
            _config,
            address(this),
            chainIndex
        );
    }

    function router(
        uint8 _type,
        uint256 _key,
        bytes memory _data
    ) private {
        require(
            datas.slotVersions[_key] == (conditions.length - 1),
            "Slot version invalid"
        );
        datas.slotVersions[_key]++;
        datas.slots[_key] = _data;
        datas.slotTypes[_key] = SolverLib.DataType(_type);

        callback(_key);
    }

    function addData(
        uint8 _type,
        uint256 _key,
        bytes memory _data
    ) external {
        require(msg.sender == config.keeper, "OnlyKeeper");
        router(_type, _key, _data);
    }

    function registerCallback(uint256 _slot, uint256 _chainIndex) external {
        require(
            msg.sender == addressFromChainIndex(_chainIndex),
            "msg.sender not solver"
        );
        requestedCallbacks[_slot].push(msg.sender);
    }

    function handleCallback(uint256 _slot) external {
        console.log("receiving callback: ", _slot);
        require(
            msg.sender ==
                addressFromChainIndex(
                    config.ingests[expectedCallbacks[_slot]].solverIndex
                ),
            "msg.sender not solver"
        );
        require(
            config.ingests[expectedCallbacks[_slot]].isDeferred,
            "Ingest not deferred"
        );
        config.ingests[expectedCallbacks[_slot]].executions++;
        router(
            config.ingests[expectedCallbacks[_slot]].dataType,
            config.ingests[expectedCallbacks[_slot]].key,
            Solver(msg.sender).getOutput(
                abi.decode(
                    config.ingests[expectedCallbacks[_slot]].data,
                    (uint256)
                )
            )
        );
        delete expectedCallbacks[_slot];
    }

    function callback(uint256 _slot) private {
        for (uint256 i; i < requestedCallbacks[_slot].length; i++) {
            if (address(requestedCallbacks[_slot][i]) != address(0)) {
                console.log("sending callback: ", _slot);
                Solver(address(requestedCallbacks[_slot][i])).handleCallback(
                    _slot
                );
                delete requestedCallbacks[_slot][i];
            }
        }
    }

    function ingest(uint256 _index) private {
        router(
            config.ingests[_index].dataType,
            config.ingests[_index].key,
            SolverLib.ingest(config.ingests[_index], address(this))
        );
    }

    function getOutput(uint256 _key) public view returns (bytes memory data) {
        require(
            datas.slotVersions[_key] == conditions.length,
            "Port invalid ver."
        );

        data = datas.slots[_key];
    }

    function ingestsValid() public view returns (bool) {
        return SolverLib.ingestsValid(config.ingests, conditions.length);
    }

    function executeSolve() public {
        require(
            conditions[conditions.length - 1].status ==
                SolverLib.Status.Initiated,
            "not Initiated"
        );
        require(ingestsValid(), "ingests invalid");

        conditions[conditions.length - 1].status = SolverLib.Status.Executed;

        console.log("Splitting position from Solver #", chainIndex);
        SolverLib.splitPosition(
            chainParent,
            config.conditionBase,
            conditions[conditions.length - 1]
        );
        SolverLib.allocatePartition(
            conditions[conditions.length - 1],
            config.conditionBase,
            address(this),
            datas,
            trackingId
        );

        postroll();
        cascade();
    }

    function postroll() internal virtual;

    function addCondition() private {
        conditions.push(
            SolverLib.createCondition(
                config.conditionBase,
                chainParent,
                address(this),
                conditions.length
            )
        );
        console.log("Added condition #", conditions.length);
    }

    function updateTimelock() internal {
        timelock = block.timestamp + (config.timelockSeconds * 1 seconds);
    }

    function proposePayouts(uint256[] calldata _payouts) external {
        require(msg.sender == config.keeper, "Only Keeper");
        require(
            conditions[conditions.length - 1].status ==
                SolverLib.Status.Executed,
            "Condition not Executed"
        );

        SolverLib.proposePayouts(conditions[conditions.length - 1], _payouts);
        updateTimelock();
    }

    function confirmPayouts() external {
        require(block.timestamp > timelock, "Timelock still locked");
        require(
            conditions[conditions.length - 1].status ==
                SolverLib.Status.OutcomeProposed,
            "Outcome not proposed"
        );
        SolverLib.confirmPayouts(conditions[conditions.length - 1]);
    }

    function arbitrate(uint256[] memory payouts) external {
        require(msg.sender == config.arbitrator, "Only arbitrator");
        require(
            conditions[conditions.length - 1].status ==
                SolverLib.Status.ArbitrationPending,
            "Not ArbitrationPending"
        );
        require(block.timestamp > timelock, "Timelock still locked");
        SolverLib.arbitrate(conditions[conditions.length - 1], payouts);
    }

    function arbitrateNull() external {
        require(msg.sender == config.arbitrator, "Only arbitrator");
        require(
            conditions[conditions.length - 1].status ==
                SolverLib.Status.ArbitrationPending,
            "Not ArbitrationPending"
        );
        SolverLib.arbitrateNull(conditions[conditions.length - 1]);
        updateTimelock();
    }

    function arbitrationRequested() external {
        require(msg.sender == config.arbitrator, "Only arbitrator");
        require(
            conditions[conditions.length - 1].status ==
                SolverLib.Status.OutcomeProposed,
            "Not OutcomeProposed"
        );

        SolverLib.arbitrationRequested(conditions[conditions.length - 1]);
        updateTimelock();
    }

    function arbitrationPending() external {
        require(msg.sender == config.arbitrator, "Only arbitrator");
        require(
            conditions[conditions.length - 1].status ==
                SolverLib.Status.ArbitrationRequested,
            "Not ArbitrationRequested"
        );
        SolverLib.arbitrationPending(conditions[conditions.length - 1]);
        updateTimelock();
    }

    function getCollectionId(uint256 _partitionIndex)
        public
        view
        returns (bytes32 collectionId)
    {
        collectionId = SolverLib.getCollectionId(
            conditions[conditions.length - 1],
            config.conditionBase.partition[_partitionIndex]
        );
    }

    function addressFromChainIndex(uint256 _index)
        public
        view
        returns (address _address)
    {
        _address = SolverLib.addressFromChainIndex(
            _index,
            address(this),
            chainParent,
            chainChild,
            chainIndex
        );
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
        for (uint256 i; i < ids.length; i++) {
            console.log("chainIndex: ", chainIndex);
            console.log("received token: ", ids[i]);
            console.log("received amount: ", values[i]);
        }
        return this.onERC1155BatchReceived.selector;
    }
}
