// SPDX-License-Identifier: GPL-3.0-or-Collateral
/* solhint-disable space-after-comma */
pragma solidity 0.8.0;

import "./ConditionalTokens.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SolverFactory {
    ConditionalTokens public conditionalTokens;

    bool solved;
    bool initiated;
    bool pendingArbitration;
    uint256 confirmationDuration;
    uint256 requestArbitorDeadline;
    bytes32 id;
    address keeper;
    address arbiter;
    IERC20 collateralToken;
    bytes32 questionId;
    uint256 outcomeSlots;
    bytes32[] data;
    uint256[] payouts;

    function registerSolvable(
        address _keeper,
        address _arbiter,
        IERC20 _collateralToken,
        bytes32 _questionId,
        uint256 _outcomeSlots,
        uint256 _confirmationHours,
        bytes32[] calldata _data
    ) external {
        bytes32 _id = keccak256(
            abi.encodePacked(
                address(this),
                _keeper,
                _arbiter,
                _questionId,
                _outcomeSlots,
                _confirmationHours,
                _data
            )
        );

        uint256[] memory _payouts;

        Solvable memory _solvable = Solvable(
            false,
            false,
            false,
            _confirmationHours * 1 hours,
            0,
            _id,
            _keeper,
            _arbiter,
            _collateralToken,
            _questionId,
            _outcomeSlots,
            _data,
            _payouts
        );
        solvables[_id] = _solvable;
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

    function initiateSolvable(bytes32 _id) external {
        solvables[_id].initiated = true;
        createCondition(solvables[_id].questionId, solvables[_id].outcomeSlots);
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
        uint256[] calldata _partition,
        IERC20 _collateralToken,
        uint256 _amount
    ) external {
        // get condition id
        bytes32 conditionId = conditionalTokens.getConditionId(
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
            conditionId,
            _partition,
            _amount
        );
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
