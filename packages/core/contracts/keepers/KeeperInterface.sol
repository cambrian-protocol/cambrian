// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "../interfaces/IConditionalTokens.sol";
import "../interfaces/ISolver.sol";

import "../interfaces/ISolver.sol";
import "../solvers/SolverLib.sol";

/**
  The virtual functions in this contract are the minimum required for a Keeper to interact with a basic Solver.
 */
abstract contract KeeperInterface is ERC165 {
    function prepareSolve(address solver, uint256 conditionIndex)
        public
        virtual
    {
        ISolver(solver).prepareSolve(conditionIndex);
    }

    function deployChild(address solver, SolverLib.Config calldata config)
        public
        virtual
    {
        ISolver(solver).deployChild(config);
    }

    function executeSolve(address solver, uint256 conditionIndex)
        public
        virtual
    {
        ISolver(solver).executeSolve(conditionIndex);
    }

    function addData(
        address solver,
        bytes32 slot,
        bytes memory data
    ) public virtual {
        ISolver(solver).addData(slot, data);
    }

    function proposePayouts(
        address solver,
        uint256 index,
        uint256[] calldata payouts
    ) public virtual {
        ISolver(solver).proposePayouts(index, payouts);
    }

    function confirmPayouts(address solver, uint256 index) public virtual {
        ISolver(solver).confirmPayouts(index);
    }

    function redeemPosition(
        address solver,
        IERC20 collateralToken,
        bytes32 parentCollectionId,
        bytes32 conditionId,
        uint256[] calldata indexSets
    ) public virtual {
        ISolver(solver).redeemPosition(
            collateralToken,
            parentCollectionId,
            conditionId,
            indexSets
        );
    }

    function calculateInterface() public pure returns (bytes4) {
        return
            this.prepareSolve.selector ^
            this.deployChild.selector ^
            this.executeSolve.selector ^
            this.addData.selector ^
            this.proposePayouts.selector ^
            this.confirmPayouts.selector ^
            this.redeemPosition.selector;
    }

    function supportsInterface(bytes4 interfaceId)
        public
        pure
        override
        returns (bool)
    {
        return
            interfaceId == this.supportsInterface.selector ||
            interfaceId == calculateInterface();
    }
}
