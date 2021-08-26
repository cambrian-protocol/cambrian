// SPDX-License-Identifier: GPL-3.0-or-Collateral
/* solhint-disable space-after-comma */
pragma solidity 0.8.0;

import "./ConditionalTokens.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "solidity-bytes-utils/contracts/BytesLib.sol";
import "./SolutionsHub.sol";
import "hardhat/console.sol";

contract Solver is Initializable {
    struct Action {
        bool executed;
        bool isPort;
        address to;
        uint256 portIndex;
        uint256 value;
        bytes data;
    }

    struct Ingest {
        bool executed;
        bool isConstant;
        uint8 port;
        uint256 key;
        uint256 solverIndex;
        bytes data;
    }

    struct Condition {
        IERC20 collateralToken; // collateral token
        address oracle; // address reporting on this condition
        bytes32 questionId; // questionId to be interpreted for reporting on conditions
        uint256 outcomeSlots; // num outcome slots for conditions
        bytes32 parentCollectionId; // ID of the parent collection above this Solver in the conditional tokens framework
        bytes32 conditionId; // ID of this condition in the conditional tokens framework
        uint256 amount; // Amount of the token being handled
        uint256[] partition; // Partition of positions for payouts
    }

    struct ConditionExecutor {
        uint256 outcomeSlots; // num outcomeslots
        uint256 parentCollectionIdPort; // bytes32Port containing parentCollectionId
        uint256 amount; // amount of collateral being used
        uint256[] partition; // Partition of positions for payouts
        uint256[][] recipientAddressPorts; // addressPorts containg recipients
        uint256[][] recipientAmounts; // amounts for each recipient for each partition
        string metadata; // condition metadata
    }

    struct Config {
        SolverFactory factory;
        address keeper; // Keeper address
        address arbiter; // Arbiter address
        uint256 timelockSeconds;
        bytes data;
        Ingest[] ingests;
        Action[] actions;
        ConditionExecutor canonConditionExecutor;
    }

    Config public config; // Primary config of the Solver
    Condition public canonCondition; // Canonical condition of the Solver
    ConditionalTokens public conditionalTokens; // ConditionalTokens contract
    IERC20 public collateralToken; // Collateral being used
    bool executeCanonConditionDone; // executeCanonCondition may only run once
    bool public solved; // True when solve is complete
    bool public executed; // True when solve has begun
    bool public pendingArbitration; // True when waiting for arbiter decision
    bool public arbitrationDelivered; // True when arbitration has been delivered
    bytes32 public solutionId; // ID of solution being solved
    address public proposalsHub; // The proposalsHub address managing this Solver;
    address public solutionsHub; // The solutionsHub address managing this Solver;
    uint256 public timelock; // Current timelock
    uint256[] payouts; // currently proposed/reported payouts

    mapping(uint256 => address) addressPort;
    mapping(uint256 => bool) boolPort;
    mapping(uint256 => bytes) bytesPort;
    mapping(uint256 => bytes32) bytes32Port;
    mapping(uint256 => uint256) uint256Port;
    mapping(uint256 => mapping(uint256 => bool)) mappedPorts; // maintains mapped ports

    modifier onlySolution() {
        require(
            msg.sender == solutionsHub,
            "Solver: Only the solutionsHub address may call this"
        );
        _;
    }

    modifier onlyKeeper() {
        require(
            msg.sender == config.keeper,
            "Solver: Only the Keeper address may call this"
        );
        _;
    }

    modifier onlyArbiter() {
        require(
            msg.sender == config.arbiter,
            "Solver: Only the Arbiter address may call this"
        );
        _;
    }

    modifier onlyThis() {
        require(
            msg.sender == address(this),
            "Solver: Only this solver may call this"
        );
        _;
    }

    modifier isPrivileged() {
        require(
            msg.sender == config.keeper || msg.sender == config.arbiter,
            "Solver: Only the Keeper or Arbiter may call this."
        );
        _;
    }

    modifier isActive() {
        require(executed == true, "Solver: Unexecuted");
        require(pendingArbitration == false, "Solver: Arbitration is pending");
        require(
            arbitrationDelivered == false,
            "Solver: Arbitration has been delivered"
        );
        require(solved == false, "Solver: Solve is complete");
        _;
    }

    modifier isWhitelisted(address _addr) {
        //TODO
        _;
    }

    function inputRouter(
        uint8 _port,
        uint256 _key,
        bytes memory _data
    ) internal {
        require(!mappedPorts[_port][_key], "Solver::Port already mapped");
        mappedPorts[_port][_key] = true;

        if (_port == 0) {
            addressPort[_key] = BytesLib.toAddress(_data, 0);
        } else if (_port == 1) {
            boolPort[_key] = BytesLib.toUint8(_data, 0) > 0 ? true : false;
        } else if (_port == 2) {
            bytesPort[_key] = _data;
        } else if (_port == 3) {
            console.log("Ingest Bytes32 Data");
            console.logBytes(_data);
            bytes32Port[_key] = BytesLib.toBytes32(_data, 0);
        } else if (_port == 4) {
            uint256Port[_key] = BytesLib.toUint256(_data, 0);
        }
    }

    function executeIngests() internal {
        for (uint256 i; i < config.ingests.length; i++) {
            ingest(config.ingests[i]);
        }
    }

    function ingest(Ingest storage _ingest) internal {
        require(!_ingest.executed, "Solver::Ingest already executed");
        _ingest.executed = true;

        if (_ingest.isConstant) {
            inputRouter(_ingest.port, _ingest.key, _ingest.data);
        } else {
            address _solver = SolutionsHub(solutionsHub).solverFromIndex(
                solutionId,
                _ingest.solverIndex
            );

            (bool success, bytes memory retData) = _solver.staticcall(
                _ingest.data
            );

            require(success, "Solver::Ingest staticcall failed");
            inputRouter(_ingest.port, _ingest.key, retData);
        }
    }

    function init(
        IERC20 _collateralToken,
        bytes32 _solutionId,
        address _proposalsHub,
        address _solutionsHub,
        Config calldata _solverConfig
    ) public {
        require(
            _solverConfig.keeper != address(0),
            "Solver: Keeper address invalid"
        );
        config = _solverConfig;

        conditionalTokens = SolutionsHub(_solutionsHub).conditionalTokens();
        collateralToken = _collateralToken;
        solutionId = _solutionId;
        proposalsHub = _proposalsHub;
        solutionsHub = _solutionsHub;
        defaultIngest();
    }

    function defaultIngest() internal {
        mappedPorts[0][0] = true;
        addressPort[0] = address(this);
    }

    function executeCanonCondition() external isActive onlyThis {
        require(
            executeCanonConditionDone == false,
            "Solver:: This has already run"
        );
        executeCanonConditionDone = true;
        console.log("Executing canon condition");

        // questionId is hash of descriptive metadata and this solver address
        canonCondition.questionId = keccak256(
            abi.encodePacked(
                config.canonConditionExecutor.metadata,
                address(this)
            )
        );

        canonCondition.outcomeSlots = config
            .canonConditionExecutor
            .outcomeSlots;
        canonCondition.parentCollectionId = bytes32Port[
            config.canonConditionExecutor.parentCollectionIdPort
        ];
        canonCondition.amount = config.canonConditionExecutor.amount;
        canonCondition.partition = config.canonConditionExecutor.partition;
        canonCondition.oracle = address(this);
        canonCondition.conditionId = conditionalTokens.getConditionId(
            address(this), // Solver is Oracle
            canonCondition.questionId,
            config.canonConditionExecutor.outcomeSlots
        );

        // prepareCondition
        conditionalTokens.prepareCondition(
            address(this),
            canonCondition.questionId,
            canonCondition.outcomeSlots
        );

        // if shallow position
        if (
            bytes32Port[config.canonConditionExecutor.parentCollectionIdPort] ==
            bytes32("")
        ) {
            IERC20 _token = IERC20(collateralToken);
            // pull collateral in
            _token.transferFrom(
                proposalsHub,
                address(this),
                config.canonConditionExecutor.amount
            );
            // approve erc20 transfer to conditional tokens contract
            _token.approve(address(conditionalTokens), 0);
            _token.approve(
                address(conditionalTokens),
                config.canonConditionExecutor.amount
            );
        }

        // splitPosition
        conditionalTokens.splitPosition(
            collateralToken,
            bytes32Port[config.canonConditionExecutor.parentCollectionIdPort],
            canonCondition.conditionId,
            config.canonConditionExecutor.partition,
            config.canonConditionExecutor.amount
        );

        allocatePartition(
            collateralToken,
            canonCondition.conditionId,
            bytes32Port[config.canonConditionExecutor.parentCollectionIdPort],
            config.canonConditionExecutor.partition,
            config.canonConditionExecutor.recipientAddressPorts,
            config.canonConditionExecutor.recipientAmounts
        );
    }

    function allocatePartition(
        IERC20 _collateralToken,
        bytes32 _conditionId,
        bytes32 _parentCollectionId,
        uint256[] storage _partition,
        uint256[][] storage _initialRecipientAddressPorts,
        uint256[][] storage _initialRecipientAmounts
    ) internal isActive {
        console.log("allocatePartition");

        for (uint256 i; i < _partition.length; i++) {
            bytes32 _collectionId = conditionalTokens.getCollectionId(
                _parentCollectionId,
                _conditionId,
                _partition[i]
            );

            uint256 _positionId = conditionalTokens.getPositionId(
                _collateralToken,
                _collectionId
            );

            for (uint256 j; j < _initialRecipientAddressPorts.length; j++) {
                conditionalTokens.safeTransferFrom(
                    address(this),
                    addressPort[_initialRecipientAddressPorts[i][j]],
                    _positionId,
                    _initialRecipientAmounts[i][j],
                    ""
                );
            }
        }
    }

    function executeSolve() external onlySolution {
        executed = true;
        executeIngests();
        unsafeExecuteActions();
    }

    function updateTimelock() internal isActive {
        timelock = block.timestamp + (config.timelockSeconds * 1 seconds);
    }

    function proposePayouts(uint256[] calldata _payouts)
        public
        isPrivileged
        isActive
    {
        payouts = _payouts;
        updateTimelock();
    }

    function confirmPayouts() external isPrivileged isActive {
        require(
            block.timestamp > timelock,
            "Solver: Timelock is still in the future"
        );
        conditionalTokens.reportPayouts(canonCondition.questionId, payouts);
        solved = true;
    }

    function arbitrate(uint256[] calldata _payouts) external onlyArbiter {
        require(executed == true, "Solver: Unexecuted");
        require(pendingArbitration == true, "Solver: Arbitration not pending");
        payouts = _payouts;
        pendingArbitration = false;
        arbitrationDelivered = true;
        updateTimelock();
    }

    function nullArbitrate() external onlyArbiter {
        require(
            pendingArbitration = true,
            "Solver: Arbitration is not pending"
        );
        pendingArbitration = false;
        updateTimelock();
    }

    function unsafeExecuteActions() private {
        for (uint256 i; i < config.actions.length; i++) {
            unsafeExecuteAction(i);
        }
    }

    function unsafeExecuteAction(uint256 _actionIndex)
        private
        isWhitelisted(config.actions[_actionIndex].to)
    {
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

    function getPayouts() public view returns (uint256[] memory) {
        return payouts;
    }

    function getCanonCollectionId(uint256 _partitionIndex)
        external
        view
        returns (bytes32 _id)
    {
        bytes32 _collectionId = conditionalTokens.getCollectionId(
            canonCondition.parentCollectionId,
            canonCondition.conditionId,
            canonCondition.partition[_partitionIndex]
        );
        return _collectionId;
    }

    function getAddress() external view returns (bytes20 _address) {
        return bytes20(address(this));
    }

    function onERC1155Received(
        address operator,
        address from,
        uint256 id,
        uint256 value,
        bytes calldata data
    ) external virtual returns (bytes4) {
        return this.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(
        address operator,
        address from,
        uint256[] calldata ids,
        uint256[] calldata values,
        bytes calldata data
    ) external virtual returns (bytes4) {
        return this.onERC1155BatchReceived.selector;
    }
}
