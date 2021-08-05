// SPDX-License-Identifier: GPL-3.0-or-Collateral
/* solhint-disable space-after-comma */
pragma solidity 0.8.0;

import "./ConditionalTokens.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Solver {
    // ConditionalTokens contract
    ConditionalTokens public conditionalTokens = ConditionalTokens(address(0));

    // Collateral token
    IERC20 collateralToken;

    // True when solve is complete
    bool solved;

    // True when solve has begun
    bool initiated;

    // True when waiting for arbiter decision
    bool pendingArbitration;

    // True when arbitration has been delivered
    bool arbitrationDelivered;

    // Keeper address
    address keeper;

    // Arbiter address
    address arbiter;

    // questionId to be interpreted for reporting on conditions
    bytes32 questionId;

    // ID of the parent collection above this Solver in the conditional tokens framework
    bytes32 parentCollectionId;

    // Partition of positions for payouts
    uint256[] partition;

    // Recipient addresses of conditional tokens for each index set in partition
    address[][] partitionAddresses;

    // Number of condition tokens allocated to _partitionAddresses
    uint256[][] partitionAmounts;

    // num outcome slots for conditions
    uint256 outcomeSlots;

    // Amount of the token being handled
    uint256 amount;

    // Mandatory delay between proposed payouts and confirmation by Keeper. Arbitration may be requested in this window.
    uint256 timelockDuration;

    // Current timelock
    uint256 timelock;

    // reported payouts
    uint256[] payouts;

    // arbitrary data
    bytes data;

    modifier onlyKeeper() {
        require(
            msg.sender == keeper,
            "Solver: Only the Keeper address may call this"
        );
        _;
    }

    modifier onlyArbiter() {
        require(
            msg.sender == arbiter,
            "Solver: Only the Arbiter address may call this"
        );
        _;
    }

    modifier privileged() {
        require(
            msg.sender == keeper || msg.sender == arbiter,
            "Solver: Only the Keeper or Arbiter may call this."
        );
        _;
    }

    modifier isActive() {
        require(initiated = true, "Solver: Uninitiated");
        require(pendingArbitration = false, "Solver: Arbitration is pending");
        require(
            arbitrationDelivered = false,
            "Solver: Arbitration has been delivered"
        );
        require(solved = false, "Solver: Solve is complete");
        _;
    }

    constructor(
        address _keeper,
        address _arbiter,
        bytes32 _parentCollectionId,
        uint256[] memory _partition,
        address[][] memory _partitionAddresses,
        uint256[][] memory _partitionAmounts,
        uint256 _outcomeSlots,
        uint256 _amount,
        uint256 _timelockDurationHours,
        bytes memory _data
    ) {
        require(_keeper != address(0), "Solver: Keeper address invalid");
        require(
            _outcomeSlots >= 2,
            "Solver: Outcome slots cannot be fewer than 2"
        );

        keeper = _keeper;
        arbiter = _arbiter;
        parentCollectionId = _parentCollectionId;
        partition = _partition;
        partitionAddresses = _partitionAddresses;
        partitionAmounts = _partitionAmounts;
        outcomeSlots = _outcomeSlots;
        amount = _amount;
        timelockDuration = _timelockDurationHours * 1 hours;
        data = _data;

        questionId = keccak256(
            abi.encodePacked(
                _keeper,
                _arbiter,
                _parentCollectionId,
                _data,
                block.timestamp
            )
        );
    }

    /**
     * @dev                  Sets or unsets the approval of a given operator. An operator is allowed to
     *                       transfer all tokens of the sender on their behalf.
     * @param operator       Address to set the approval
     * @param approved       Representing the status of the approval to be set
     */
    function setApproval(address operator, bool approved) external {
        conditionalTokens.setApprovalForAll(operator, approved);
    }

    function createCondition(bytes32 _questionId, uint256 _outcomeSlots)
        internal
        isActive
    {
        conditionalTokens.prepareCondition(
            address(this),
            _questionId,
            _outcomeSlots
        );
    }

    /**
     * @dev
     * @param _questionId          An identifier for the question to be answered by the oracle.
     * @param _parentCollectionId  The ID of the outcome collections common to the position being split and
     *                             the split target positions. May be null, in which only the collateral is shared.
     * @param _collateralToken     The address of the positions' backing collateral token.
     * @param _amount              The amount of collateral or stake to split.
     */
    function splitCondition(
        bytes32 _questionId,
        bytes32 _parentCollectionId,
        uint256 _outcomeSlots,
        uint256[] memory _partition,
        IERC20 _collateralToken,
        uint256 _amount
    ) public onlyKeeper isActive {
        require(initiated == true, "Solver: Uninitiated");

        // get condition id
        bytes32 _conditionId = conditionalTokens.getConditionId(
            address(this), // Solver is Oracle
            _questionId,
            _outcomeSlots
        );
        // if shallow position
        if (_parentCollectionId == bytes32(0)) {
            // pull collateral in
            IERC20(_collateralToken).transferFrom(
                msg.sender,
                address(this),
                _amount
            );
            // approve erc20 transfer to conditional tokens contract
            IERC20(_collateralToken).approve(
                address(conditionalTokens),
                _amount
            );
        }
        // splitPosition
        conditionalTokens.splitPosition(
            _collateralToken,
            _parentCollectionId,
            _conditionId,
            _partition,
            _amount
        );
    }

    function allocatePartition() private {
        bytes32 _conditionId = conditionalTokens.getConditionId(
            address(this), // Solver is Oracle
            questionId,
            outcomeSlots
        );

        for (uint256 i; i < partition.length; i++) {
            bytes32 _collectionId = conditionalTokens.getCollectionId(
                parentCollectionId,
                _conditionId,
                partition[i]
            );

            uint256 _positionId = conditionalTokens.getPositionId(
                collateralToken,
                _collectionId
            );

            for (uint256 j; j < partitionAddresses.length; j++) {
                conditionalTokens.safeTransferFrom(
                    address(this),
                    partitionAddresses[i][j],
                    _positionId,
                    partitionAmounts[i][j],
                    ""
                );
            }
        }
    }

    function initiateSolve() external onlyKeeper {
        initiated = true;
        createCondition(questionId, outcomeSlots);
        splitCondition(
            questionId,
            parentCollectionId,
            outcomeSlots,
            partition,
            collateralToken,
            amount
        );
        allocatePartition();
        processData(data);
    }

    function processData(bytes storage _data)
        private
        isActive
        returns (bytes memory)
    {
        return _data;
    }

    function updateTimelock() private isActive {
        timelock = block.timestamp + timelockDuration;
    }

    function proposePayouts(uint256[] calldata _payouts)
        public
        privileged
        isActive
    {
        payouts = _payouts;
        updateTimelock();
    }

    function confirmPayouts() external privileged isActive {
        require(
            block.timestamp > timelock,
            "Solver: Timelock is still in the future"
        );
        conditionalTokens.reportPayouts(questionId, payouts);
        solved = true;
    }

    function arbitrate(uint256[] calldata _payouts) external onlyArbiter {
        require(initiated == true, "Solver: Uninitiated");
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

    function onERC1155Received(
        address operator,
        address from,
        uint256 id,
        uint256 value,
        bytes calldata data
    ) external pure returns (bytes4) {
        return this.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(
        address operator,
        address from,
        uint256[] calldata ids,
        uint256[] calldata values,
        bytes calldata data
    ) external pure returns (bytes4) {
        return this.onERC1155BatchReceived.selector;
    }
}
