// SPDX-License-Identifier: LGPL-3.0
pragma solidity ^0.8.14;

import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

import "../../interfaces/ISolver.sol";

abstract contract Arbitrator {
    function requestArbitration(ISolver solver, uint256 conditionIndex)
        external
        payable
        virtual
    {
        _requestArbitration(solver, conditionIndex);
    }

    function arbitrateNull(ISolver solver, uint256 conditionIndex)
        external
        virtual
    {
        _arbitrateNull(solver, conditionIndex);
    }

    function arbitrate(
        ISolver solver,
        uint256 conditionIndex,
        uint256[] memory outcomes
    ) external virtual {
        _arbitrate(solver, conditionIndex, outcomes);
    }

    function _requestArbitration(ISolver solver, uint256 conditionIndex)
        internal
    {
        solver.requestArbitration(conditionIndex);
    }

    function _arbitrateNull(ISolver solver, uint256 conditionIndex) internal {
        solver.arbitrateNull(conditionIndex);
    }

    function _arbitrate(
        ISolver solver,
        uint256 conditionIndex,
        uint256[] memory outcomes
    ) internal {
        solver.arbitrate(conditionIndex, outcomes);
    }
}
