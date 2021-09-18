// SPDX-License-Identifier: GPL-3.0-or-Collateral
/* solhint-disable space-after-comma */
pragma solidity 0.8.0;

import "./ConditionalTokens.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Receiver.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "solidity-bytes-utils/contracts/BytesLib.sol";
import "./SolutionsHub.sol";
import "hardhat/console.sol";

contract Solver is Initializable, ERC1155Receiver {
    struct Action {
        bool executed;
        bool isPort;
        address to;
        uint256 portIndex;
        uint256 value;
        bytes data;
    }

    /**
        @dev                    Expected sources of data being ingested into the Solver
        executions              Number of times this Ingest has been executed
        isDeferred              Data is waiting on an upstream action and must be ingested manually later
        isConstant              Data is supplied directly which cannot change
        port                    Destination port for data: addressPort || boolPort || bytesPort || bytes32Port || uint256Port
        key                     Destination key for data
        solverIndex             Index of the Solver in the chain to make this call to
        data                    Raw when isConstant=true, else an encoded function call
     */
    struct Ingest {
        uint256 executions;
        bool isDeferred;
        bool isConstant;
        uint8 port;
        uint256 key;
        uint256 solverIndex;
        bytes data;
    }

    /**
        @dev                    Status state for Conditions
        Initiated               Default state
        Executed                Solver has executed according to configuration
        OutcomeProposed         Outcome has been proposed for reporting.
        ArbitrationRequested    One party has requested arbitration on this condition
        ArbitrationPending      An official dispute has been raised and requires arbitration
        ArbitrationDelivered    Arbitration (except 'null' arbitration) has been delivered for this condition
        OutcomeReported         Outcome has been reported to the CTF via reportPayouts()
     */
    enum Status {
        Initiated,
        Executed,
        OutcomeProposed,
        ArbitrationRequested,
        ArbitrationPending,
        ArbitrationDelivered,
        OutcomeReported
    }

    /**
        @dev                    Condition object created by addCondition() from ConditionBase
        questionId              keccak256(abi.encodePacked(config.conditionBase.metadata, address(this), conditions.length))
        parentCollectionId      ID of the parent collection above this Solver in the CTF
        conditionId             ID of this condition in the CTF
        payouts                 Currently proposed payouts. Final if reported == true
        status                  Status of this condition
     */
    struct Condition {
        bytes32 questionId;
        bytes32 parentCollectionId;
        bytes32 conditionId;
        uint256[] payouts;
        Status status;
    }

    /**
        @dev                    Used to generate conditions when addCondition() is called
        outcomeSlots            Num outcome slots
        ParentColl...           Index of partition to get parentCollectionId from parent Solver's uint256[] partition
        amount                  Amount of collateral being used        // TODO maybe make this dynamic also
        partition               Partition of positions for payouts
        recipientAddressPorts   Arrays of [i] for addressPorts[i] containing CT recipients
        recipientAmounts        Arrays containing amount of CTs to send to each recipient for each partition
        metadata                Descriptive string describing the condition
     */
    struct ConditionBase {
        uint256 outcomeSlots;
        uint256 parentCollectionPartitionIndex;
        uint256 amount;
        uint256[] partition;
        uint256[][] recipientAddressPorts;
        uint256[][] recipientAmounts;
        string metadata;
    }

    /**
        @dev                    Configuration of this Solver
        factory                 The implementation address for this Solver
        keeper                  Keeper address
        arbitrator                 Arbitrator address
        timelockSeconds         Number of seconds to increment timelock for during critical activities
        data                    Arbitrary data
        ingests;                Data ingests to be performed to bring data in from other Solver
        actions                 Arbitrary actions to be run during execution
        conditionBase           Base to create conditions from
     */
    struct Config {
        SolverFactory factory;
        address keeper;
        address arbitrator;
        uint256 timelockSeconds;
        bytes data;
        Ingest[] ingests;
        Action[] actions;
        ConditionBase conditionBase;
    }

    Config public config; // Primary config of the Solver
    Condition[] public conditions; // Array of conditions

    ConditionalTokens public conditionalTokens; // ConditionalTokens contract
    IERC20 public collateralToken; // Collateral being used

    bytes32 public proposalId; // ID of proposal linked to the solution
    bytes32 public solutionId; // ID of solution being solved
    address public proposalsHub; // The proposalsHub address managing this Solver
    address public solutionsHub; // The solutionsHub address managing this Solver
    uint256 public timelock; // Current timelock

    mapping(uint256 => address) public addressPort;
    mapping(uint256 => bool) public boolPort;
    mapping(uint256 => bytes) public bytesPort;
    mapping(uint256 => bytes32) public bytes32Port;
    mapping(uint256 => uint256) public uint256Port;
    mapping(uint256 => mapping(uint256 => bool)) public lockedPorts; // locks constant ports
    mapping(uint256 => mapping(uint256 => uint256)) public portVersions; // version tracking for unlocked ports

    modifier solverOrKeeper() {
        if (msg.sender == config.keeper) {
            _;
        } else {
            address[] memory _solvers = SolutionsHub(solutionsHub)
                .getSolutionSolverAddresses(solutionId);
            for (uint256 i; i < _solvers.length; i++) {
                if (msg.sender == _solvers[i]) {
                    _;
                }
            }
        }
    }

    function init(
        IERC20 _collateralToken,
        bytes32 _solutionId,
        bytes32 _proposalId,
        address _proposalsHub,
        address _solutionsHub,
        Config calldata _solverConfig
    ) external {
        require(
            msg.sender == address(_solverConfig.factory),
            "Solver::Only factory may call init"
        );
        require(
            _solverConfig.keeper != address(0),
            "Solver: Keeper address invalid"
        );

        config = _solverConfig;

        conditionalTokens = SolutionsHub(_solutionsHub).conditionalTokens();
        collateralToken = _collateralToken;
        solutionId = _solutionId;
        proposalId = _proposalId;
        proposalsHub = _proposalsHub;
        solutionsHub = _solutionsHub;
    }

    function router(
        uint8 _port,
        uint256 _key,
        bytes memory _data
    ) private {
        if (_port == 0) {
            addressPort[_key] = BytesLib.toAddress(_data, 0);
        } else if (_port == 1) {
            boolPort[_key] = BytesLib.toUint8(_data, 0) > 0 ? true : false;
        } else if (_port == 2) {
            bytesPort[_key] = _data;
        } else if (_port == 3) {
            bytes32Port[_key] = BytesLib.toBytes32(_data, 0);
        } else if (_port == 4) {
            uint256Port[_key] = BytesLib.toUint256(_data, 0);
        }
    }

    function constantRouter(
        uint8 _port,
        uint256 _key,
        bytes memory _data
    ) internal {
        require(!lockedPorts[_port][_key], "Solver::Constant port locked");
        lockedPorts[_port][_key] = true;
        router(_port, _key, _data);
    }

    function dynamicRouter(
        uint8 _port,
        uint256 _key,
        bytes memory _data
    ) internal {
        require(!lockedPorts[_port][_key], "Solver::Dynamic port locked");
        require(
            portVersions[_port][_key] == (conditions.length - 1),
            "Solver::Port version does not match condition version"
        );
        portVersions[_port][_key]++;
        router(_port, _key, _data);
    }

    function addData(
        uint8 _port,
        uint256 _key,
        bytes memory _data
    ) external solverOrKeeper {
        dynamicRouter(_port, _key, _data);
    }

    function executeIngests() private {
        console.log("Executing ingests");
        for (uint256 i; i < config.ingests.length; i++) {
            if (!config.ingests[i].isDeferred) {
                ingest(i);
            }
        }
    }

    function ingest(uint256 _index) public {
        config.ingests[_index].executions++;

        console.logAddress(address(this));
        console.logUint(config.ingests[_index].port);
        console.logUint(config.ingests[_index].key);
        console.logBytes(config.ingests[_index].data);

        if (config.ingests[_index].isConstant) {
            constantRouter(
                config.ingests[_index].port,
                config.ingests[_index].key,
                config.ingests[_index].data
            );
        } else {
            bytes memory _retData = staticcallSolver(
                config.ingests[_index].solverIndex,
                config.ingests[_index].data
            );
            dynamicRouter(
                config.ingests[_index].port,
                config.ingests[_index].key,
                _retData
            );
        }
    }

    function getOutput(uint256 _port, uint256 _key)
        external
        view
        returns (bytes memory data)
    {
        require(
            lockedPorts[_port][_key] ||
                portVersions[_port][_key] == conditions.length,
            "Solver::Port is unmapped or wrong version."
        );
        if (_port == 0) {
            return abi.encodePacked(addressPort[_key]);
        } else if (_port == 1) {
            return abi.encodePacked(boolPort[_key]);
        } else if (_port == 2) {
            return abi.encodePacked(bytesPort[_key]);
        } else if (_port == 3) {
            return abi.encodePacked(bytes32Port[_key]);
        } else if (_port == 3) {
            return abi.encodePacked(uint256Port[_key]);
        }
    }

    function deferredIngestsValid() public view returns (bool) {
        bool _bool = true;

        for (uint256 i; i < config.ingests.length; i++) {
            if (
                config.ingests[i].isDeferred &&
                (config.ingests[i].executions != conditions.length)
            ) {
                _bool = false;
            }
        }

        return _bool;
    }

    function addCondition() private {
        console.log("Adding condition");

        Condition memory _condition;

        _condition.questionId = keccak256(
            abi.encodePacked(
                config.conditionBase.metadata,
                address(this),
                conditions.length
            )
        );

        address _parentSolver = SolutionsHub(solutionsHub).parentSolver(
            solutionId
        );
        if (_parentSolver == address(0)) {
            _condition.parentCollectionId = bytes32(""); // top level collection
        } else {
            _condition.parentCollectionId = Solver(_parentSolver)
                .getCanonCollectionId(
                    config.conditionBase.parentCollectionPartitionIndex
                );
        }

        _condition.conditionId = conditionalTokens.getConditionId(
            address(this), // Solver is Oracle
            _condition.questionId,
            config.conditionBase.outcomeSlots
        );

        conditions.push(_condition);

        prepareCondition();
    }

    function prepareCondition() private {
        // prepareCondition
        conditionalTokens.prepareCondition(
            address(this),
            conditions[conditions.length - 1].questionId,
            config.conditionBase.outcomeSlots
        );
    }

    function handleShallowPosition() private {
        if (
            conditions[conditions.length - 1].parentCollectionId == bytes32("")
        ) {
            IERC20 _token = IERC20(collateralToken);
            // pull collateral in
            _token.transferFrom(
                proposalsHub,
                address(this),
                config.conditionBase.amount
            );
            // approve erc20 transfer to conditional tokens contract
            _token.approve(address(conditionalTokens), 0);
            _token.approve(
                address(conditionalTokens),
                config.conditionBase.amount
            );
        }
    }

    function splitPosition() private {
        console.log("Split position");
        conditionalTokens.splitPosition(
            collateralToken,
            conditions[conditions.length - 1].parentCollectionId,
            conditions[conditions.length - 1].conditionId,
            config.conditionBase.partition,
            config.conditionBase.amount
        );
    }

    function allocatePartition() private {
        console.log("allocatePartition");

        for (uint256 i; i < config.conditionBase.partition.length; i++) {
            console.logBytes32(
                conditions[conditions.length - 1].parentCollectionId
            );
            bytes32 _collectionId = conditionalTokens.getCollectionId(
                conditions[conditions.length - 1].parentCollectionId,
                conditions[conditions.length - 1].conditionId,
                config.conditionBase.partition[i]
            );

            uint256 _positionId = conditionalTokens.getPositionId(
                collateralToken,
                _collectionId
            );

            for (
                uint256 j;
                j < config.conditionBase.recipientAddressPorts.length;
                j++
            ) {
                if (config.conditionBase.recipientAmounts[i][j] > 0) {
                    conditionalTokens.safeTransferFrom(
                        address(this),
                        addressPort[
                            config.conditionBase.recipientAddressPorts[i][j]
                        ],
                        _positionId,
                        config.conditionBase.recipientAmounts[i][j],
                        abi.encode(proposalId)
                    );
                }
            }
        }
    }

    function prepareSolve() public {
        console.log("Preparing solve");
        addCondition();
        executeIngests();
    }

    function executeSolve() public {
        console.log("Executing solve");
        require(
            conditions[conditions.length - 1].status == Status.Initiated,
            "Solver::Condition not status Initiated"
        );
        require(deferredIngestsValid(), "Solver::Deferred ingests invalid");

        conditions[conditions.length - 1].status = Status.Executed;

        handleShallowPosition();
        splitPosition();
        allocatePartition();
        unsafeExecuteActions();
        cascade();
    }

    function cascade() private {
        address _childSolver = SolutionsHub(solutionsHub).childSolver(
            solutionId
        );
        if (
            _childSolver != address(0) &&
            Solver(_childSolver).deferredIngestsValid()
        ) {
            Solver(_childSolver).executeSolve();
        }
    }

    function updateTimelock() internal {
        timelock = block.timestamp + (config.timelockSeconds * 1 seconds);
    }

    function proposePayouts(uint256[] calldata _payouts) external {
        require(msg.sender == config.keeper, "Solver::Only Keeper");
        require(
            conditions[conditions.length - 1].status == Status.Executed,
            "Solver::Condition state not Status.Executed"
        );

        conditions[conditions.length - 1].status = Status.OutcomeProposed;
        conditions[conditions.length - 1].payouts = _payouts;
        updateTimelock();
    }

    function confirmPayouts() external {
        require(msg.sender == config.keeper, "Solver::Only Keeper");
        require(block.timestamp > timelock, "Solver::Timelock still locked");
        require(
            conditions[conditions.length - 1].status == Status.OutcomeProposed,
            "Solver::Outcome must be proposed first"
        );

        conditionalTokens.reportPayouts(
            conditions[conditions.length - 1].questionId,
            conditions[conditions.length - 1].payouts
        );
        conditions[conditions.length - 1].status = Status.OutcomeReported;
    }

    function arbitrate(uint256[] memory payouts) external {
        require(msg.sender == config.arbitrator, "Solver::Only arbitrator");
        require(
            conditions[conditions.length - 1].status ==
                Status.ArbitrationPending,
            "Solver::Not Status.ArbitrationPending"
        );
        require(block.timestamp > timelock, "Solver::Timelock still locked");

        conditions[conditions.length - 1].status = Status.ArbitrationDelivered;
        conditionalTokens.reportPayouts(
            conditions[conditions.length - 1].questionId,
            payouts
        );
    }

    function arbitrateNull() external {
        require(msg.sender == config.arbitrator, "Solver::Only arbitrator");
        require(
            conditions[conditions.length - 1].status ==
                Status.ArbitrationPending,
            "Solver::Not Status.ArbitrationPending"
        );

        conditions[conditions.length - 1].status = Status.OutcomeProposed;
        updateTimelock();
    }

    function arbitrationRequested() external {
        require(msg.sender == config.arbitrator, "Solver::Only arbitrator");
        require(
            conditions[conditions.length - 1].status == Status.OutcomeProposed,
            "Solver::Not Status.OutcomeProposed"
        );
        conditions[conditions.length - 1].status = Status.ArbitrationRequested;
        updateTimelock();
    }

    function arbitrationPending() external {
        require(msg.sender == config.arbitrator, "Solver::Only arbitrator");
        require(
            conditions[conditions.length - 1].status ==
                Status.ArbitrationRequested,
            "Solver::Not Status.ArbitrationRequested"
        );
        conditions[conditions.length - 1].status = Status.ArbitrationPending;
        updateTimelock();
    }

    function unsafeExecuteActions() private {
        for (uint256 i; i < config.actions.length; i++) {
            unsafeExecuteAction(i);
        }
    }

    function unsafeExecuteAction(uint256 _actionIndex) private {
        require(
            !config.actions[_actionIndex].executed,
            "Solver::action executed"
        );
        require(
            address(this).balance >= config.actions[_actionIndex].value,
            "Solver::insufficient eth"
        );

        // execute call
        config.actions[_actionIndex].executed = true;

        Action memory _action = config.actions[_actionIndex];

        if (_action.isPort) {
            _action.to = addressPort[_action.portIndex];
        }

        (bool success, bytes memory retData) = _action.to.call{
            value: _action.value
        }(_action.data);

        console.logBool(success);
        console.logBytes(retData);
        require(success, "Solver::call failure");
    }

    function getCanonCollectionId(uint256 _partitionIndex)
        external
        view
        returns (bytes32 _id)
    {
        bytes32 _collectionId = conditionalTokens.getCollectionId(
            conditions[conditions.length - 1].parentCollectionId,
            conditions[conditions.length - 1].conditionId,
            config.conditionBase.partition[_partitionIndex]
        );
        return _collectionId;
    }

    function solverAddressFromIndex(uint256 _index)
        external
        view
        returns (bytes20 _address)
    {
        address _solver = SolutionsHub(solutionsHub).solverFromIndex(
            solutionId,
            _index
        );
        return bytes20(_solver);
    }

    function staticcallSolver(uint256 _solverIndex, bytes memory _data)
        public
        view
        returns (bytes memory)
    {
        address _solver = SolutionsHub(solutionsHub).solverFromIndex(
            solutionId,
            _solverIndex
        );

        (bool success, bytes memory retData) = _solver.staticcall(_data);

        require(success, "Solver::Ingest staticcall failed");
        return retData;
    }

    function getPayouts() public view returns (uint256[] memory) {
        return conditions[conditions.length - 1].payouts;
    }

    function numConditions() public view returns (uint256) {
        return conditions.length;
    }

    function arbitrator() public view returns (address) {
        return config.arbitrator;
    }

    function keeper() public view returns (address) {
        return config.keeper;
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
