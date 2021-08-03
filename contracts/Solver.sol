// SPDX-License-Identifier: GPL-3.0-or-Collateral
/* solhint-disable space-after-comma */
pragma solidity 0.8.0;

import "./ConditionalTokens.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Solver {
    // ConditionalTokens contract
    ConditionalTokens public conditionalTokens;

    // Collateral token
    IERC20 collateralToken;

    // True when solve is complete
    bool solved;

    // True when solve has begun
    bool initiated;

    // True when waiting for arbiter decision
    bool pendingArbitration;

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

    modifier protected() {
        require(
            msg.sender == keeper || msg.sender == arbiter,
            "Solver: Only the Keeper or Arbiter may call this."
        );
        _;
    }

    constructor(
        ConditionalTokens _conditionalTokens,
        address _keeper,
        address _arbiter,
        bytes32 _questionId,
        bytes32 _parentCollectionId,
        uint256[] memory _partition,
        uint256 _outcomeSlots,
        uint256 _amount,
        uint256 _timelockDurationHours,
        bytes memory _data
    ) {
        require(
            _conditionalTokens != ConditionalTokens(address(0)),
            "Solver: ConditionalTokens address invalid"
        );
        require(_keeper != address(0), "Solver: Keeper address invalid");
        require(
            _outcomeSlots >= 2,
            "Solver: Outcome slots cannot be fewer than 2"
        );

        conditionalTokens = _conditionalTokens;
        keeper = _keeper;
        arbiter = _arbiter;
        questionId = _questionId;
        parentCollectionId = _parentCollectionId;
        partition = _partition;
        outcomeSlots = _outcomeSlots;
        amount = _amount;
        timelockDuration = _timelockDurationHours * 1 hours;
        data = _data;
    }

    function createCondition(bytes32 _questionId, uint256 _outcomeSlots)
        internal
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
    ) public onlyKeeper {
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

    function initiateSolvable() external {
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
        processData(data);
    }

    function processData(bytes storage _data) internal returns (bytes memory) {
        return _data;
    }

    function updateTimelock() private {
        timelock = block.timestamp + timelockDuration;
    }

    function proposePayouts(uint256[] calldata _payouts) public protected {
        require(pendingArbitration == false, "Solver: Arbitration is pending");
        payouts = _payouts;
        updateTimelock();
    }

    function confirmPayouts() external protected {
        require(
            block.timestamp > timelock,
            "Solver: Timelock is still in the future"
        );
        require(pendingArbitration == false, "Solver: Arbitration is pending");
        conditionalTokens.reportPayouts(questionId, payouts);
    }

    function receiveArbitration(uint256[] calldata _payouts)
        external
        onlyArbiter
    {
        payouts = _payouts;
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
