// SPDX-License-Identifier: GPL-3.0-or-Collateral
/* solhint-disable space-after-comma */
pragma solidity 0.8.0;

import "./interfaces/IConditionalTokens.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Receiver.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "./SolutionsHub.sol";
import "./SolverLib.sol";

contract Solver is Initializable, ERC1155Receiver {
    SolverLib.Config public config; // Primary config of the Solver
    SolverLib.Condition[] public conditions; // Array of conditions

    IERC20 public collateralToken; // Collateral being used

    address public chainParent; // Parent solver
    address public chainChild; // Child solver
    uint256 public chainIndex; // This Solver's index in chain
    uint256 public timelock; // Current timelock
    bytes32 public trackingId; // Settable for adding some higher-level trackingId (eg. id of a proposal this solver belongs to)

    SolverLib.Datas datas;

    function init(
        IERC20 _collateralToken,
        address _chainParent,
        uint256 _chainIndex,
        SolverLib.Config calldata _solverConfig
    ) external {
        require(
            msg.sender == address(0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512), // FACTORY DEV ADDRESS
            "Only factory"
        );
        require(_solverConfig.keeper != address(0), "Keeper invalid");
        collateralToken = _collateralToken;
        chainParent = _chainParent;
        chainIndex = _chainIndex;
        config = _solverConfig;
    }

    function deployChild(SolverLib.Config calldata _config)
        public
        returns (Solver _solver)
    {
        require(chainChild == address(0), "Solver has child");

        (chainChild, _solver) = SolverLib.deployChild(
            _config,
            collateralToken,
            address(this),
            chainIndex
        );
    }

    function router(
        uint8 _type,
        uint256 _key,
        bool _constant,
        bytes memory _data
    ) private {
        require(!datas.lockedPorts[_key], "Port locked");
        if (_constant) {
            datas.lockedPorts[_key] = true;
        } else {
            require(
                datas.portVersions[_key] == (conditions.length - 1),
                "Port version invalid"
            );
            datas.portVersions[_key]++;
        }
        datas.ports[_key] = _data;
        datas.portTypes[_key] = SolverLib.DataType(_type);
    }

    function addData(
        uint8 _type,
        uint256 _key,
        bytes memory _data
    ) external {
        require(msg.sender == config.keeper, "OnlyKeeper");
        router(_type, _key, false, _data);
    }

    function ingest(uint256 _index) public {
        bytes memory data = SolverLib.ingest(
            config.ingests[_index],
            address(this)
        );

        router(
            config.ingests[_index].port,
            config.ingests[_index].key,
            config.ingests[_index].isConstant,
            data
        );
    }

    function getOutput(uint256 _key) external view returns (bytes memory data) {
        require(
            datas.lockedPorts[_key] ||
                datas.portVersions[_key] == conditions.length,
            "Port invalid."
        );

        data = datas.ports[_key];
    }

    function ingestsValid() public view returns (bool) {
        return SolverLib.ingestsValid(config.ingests, conditions.length);
    }

    function prepareSolve() public {
        addCondition();

        for (uint256 i; i < config.ingests.length; i++) {
            if (!config.ingests[i].isDeferred) {
                ingest(i);
            }
        }
    }

    function executeSolve() public {
        require(
            conditions[conditions.length - 1].status ==
                SolverLib.Status.Initiated,
            "not Initiated"
        );
        require(ingestsValid(), "ingests invalid");

        conditions[conditions.length - 1].status = SolverLib.Status.Executed;

        SolverLib.splitPosition(
            chainParent,
            config.conditionBase,
            conditions[conditions.length - 1],
            collateralToken
        );

        SolverLib.allocatePartition(
            conditions[conditions.length - 1],
            collateralToken,
            config.conditionBase,
            address(this),
            datas,
            trackingId
        );
        SolverLib.unsafeExecuteActions(config.actions, datas);
        cascade();
    }

    function cascade() private {
        if (chainChild != address(0) && Solver(chainChild).ingestsValid()) {
            Solver(chainChild).executeSolve();
        }
    }

    function addCondition() private {
        conditions.push(
            SolverLib.createCondition(
                config.conditionBase,
                chainParent,
                address(this),
                conditions.length
            )
        );
    }

    function updateTimelock() internal {
        timelock = block.timestamp + (config.timelockSeconds * 1 seconds);
    }

    function proposePayouts(uint256[] calldata _payouts) external {
        require(msg.sender == config.keeper, "Only Keeper");
        require(
            conditions[conditions.length - 1].status ==
                SolverLib.Status.Executed,
            "Condition Executed"
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
        SolverLib.reportPayouts(conditions[conditions.length - 1]);
    }

    function arbitrate(uint256[] memory payouts) external {
        require(msg.sender == config.arbitrator, "Only arbitrator");
        require(
            conditions[conditions.length - 1].status ==
                SolverLib.Status.ArbitrationPending,
            "Not ArbitrationPending"
        );
        require(block.timestamp > timelock, "Timelock still locked");
        SolverLib.reportPayouts(conditions[conditions.length - 1], payouts);
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

    function getCanonCollectionId(uint256 _partitionIndex)
        public
        view
        returns (bytes32 collectionId)
    {
        collectionId = SolverLib.getCanonCollectionId(
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
        return this.onERC1155BatchReceived.selector;
    }
}
