// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "../interfaces/IConditionalTokens.sol";
import "../interfaces/ISolver.sol";

import "../interfaces/ISolver.sol";
import "../solvers/SolverLib.sol";

import "../Module.sol";

abstract contract Keeper is Module {
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

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override
        returns (bool)
    {
        return
            interfaceId == type(Keeper).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
