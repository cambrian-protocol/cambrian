// SPDX-License-Identifier: GPL-3.0-or-Collateral
/* solhint-disable space-after-comma */
pragma solidity 0.8.0;

import "../ConditionalTokens.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ISolver {
    /**
     * @dev                  Sets or unsets the approval of a given operator. An operator is allowed to
     *                       transfer all tokens of the sender on their behalf.
     * @param operator       Address to set the approval
     * @param approved       Representing the status of the approval to be set
     */
    function setApproval(address operator, bool approved) external;

    function createCondition(bytes32 _questionId, uint256 _outcomeSlots)
        external;

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
    ) external;

    function allocatePartition(
        uint256[] calldata _partition,
        uint256[][] calldata _amounts,
        address[][] calldata _addresses
    ) external;

    function prepareSolve() external;

    function executeSolve() external;

    function proposePayouts(uint256[] calldata _payouts) external;

    function confirmPayouts() external;

    function arbitrate(uint256[] calldata _payouts) external;

    function nullArbitrate() external;

    function executeActions() external;

    function executeAction(uint256 _actionIndex)
        external
        returns (bytes memory);

    function onERC1155Received(
        address operator,
        address from,
        uint256 id,
        uint256 value,
        bytes calldata data
    ) external pure returns (bytes4);

    function onERC1155BatchReceived(
        address operator,
        address from,
        uint256[] calldata ids,
        uint256[] calldata values,
        bytes calldata data
    ) external pure returns (bytes4);
}
