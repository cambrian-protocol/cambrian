// SPDX-License-Identifier: GPL-3.0-or-Collateral
/* solhint-disable space-after-comma */
pragma solidity 0.8.0;

import "./ConditionalTokens.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "./Minion.sol";
import "./SolutionsHub.sol";
import "hardhat/console.sol";

contract Solver is Initializable {
    struct Config {
        SolverFactory factory;
        address keeper; // Keeper address
        address arbiter; // Arbiter address
        uint256 timelockSeconds;
        bytes data;
        Minion.Action[] actions;
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
    }

    function allocatePartition(
        IERC20 _collateralToken,
        bytes32 _conditionId,
        bytes32 _parentCollectionId,
        uint256[] calldata _partition,
        address[][] calldata _initialRecipientAddresses,
        uint256[][] calldata _initialRecipientAmounts
    ) internal isActive {
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

            for (uint256 j; j < _initialRecipientAddresses.length; j++) {
                conditionalTokens.safeTransferFrom(
                    address(this),
                    _initialRecipientAddresses[i][j],
                    _positionId,
                    _initialRecipientAmounts[i][j],
                    ""
                );
            }
        }
    }

    function executeCanonCondition(
        uint256 _outcomeSlots,
        bytes32 _parentCollectionId,
        uint256 _amount,
        uint256[] calldata _partition,
        address[][] calldata _initialRecipientAddresses,
        uint256[][] calldata _initialRecipientAmounts,
        string calldata _metadata
    ) external isActive onlyThis {
        require(
            executeCanonConditionDone == false,
            "Solver:: This has already run"
        );
        executeCanonConditionDone = true;

        // questionId is hash of descriptive metadata and this solver address
        canonCondition.questionId = keccak256(
            abi.encodePacked(_metadata, address(this))
        );

        canonCondition.outcomeSlots = _outcomeSlots;
        canonCondition.parentCollectionId = _parentCollectionId;
        canonCondition.amount = _amount;
        canonCondition.partition = _partition;
        canonCondition.oracle = address(this);
        canonCondition.conditionId = conditionalTokens.getConditionId(
            address(this), // Solver is Oracle
            canonCondition.questionId,
            _outcomeSlots
        );

        // prepareCondition
        conditionalTokens.prepareCondition(
            address(this),
            canonCondition.questionId,
            canonCondition.outcomeSlots
        );

        // if shallow position
        if (_parentCollectionId == bytes32(0)) {
            IERC20 _token = IERC20(collateralToken);
            // pull collateral in
            _token.transferFrom(proposalsHub, address(this), _amount);
            // approve erc20 transfer to conditional tokens contract
            _token.approve(address(conditionalTokens), _amount);
        }

        // splitPosition
        conditionalTokens.splitPosition(
            collateralToken,
            _parentCollectionId,
            canonCondition.conditionId,
            _partition,
            _amount
        );

        allocatePartition(
            collateralToken,
            canonCondition.conditionId,
            _parentCollectionId,
            _partition,
            _initialRecipientAddresses,
            _initialRecipientAmounts
        );
    }

    function executeSolve() external onlySolution {
        executed = true;
        executeActions();
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

    function executeActions() private {
        for (uint256 i; i < config.actions.length; i++) {
            executeAction(i);
        }
    }

    function executeAction(uint256 _actionIndex)
        private
        isWhitelisted(config.actions[_actionIndex].to)
        returns (bytes memory)
    {
        require(
            !config.actions[_actionIndex].executed,
            "Solver::action executed"
        );
        require(
            address(this).balance >= config.actions[_actionIndex].value,
            "Solver::insufficient eth"
        );

        Minion.Action memory action = config.actions[_actionIndex];

        if (action.useSolverIdx) {
            action.to = SolutionsHub(solutionsHub).solverFromIndex(
                solutionId,
                action.solverIdx
            );
        }

        // execute call
        config.actions[_actionIndex].executed = true;

        (bool success, bytes memory retData) = action.to.call{
            value: action.value
        }(action.data);

        require(success, "Solver::call failure");
        return retData;
    }

    function getPayouts() public view returns (uint256[] memory) {
        return payouts;
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
