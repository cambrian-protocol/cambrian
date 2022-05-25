// SPDX-License-Identifier: LGPL-3.0
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

import "../../modules/Module.sol";
import "../../interfaces/ISolver.sol";

abstract contract Arbitrator {
    function requestArbitration(ISolver solver, uint256 conditionIndex)
        external
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
        uint256[] memory payouts
    ) external virtual {
        _arbitrate(solver, conditionIndex, payouts);
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
        uint256[] memory payouts
    ) internal {
        solver.arbitrate(conditionIndex, payouts);
    }
}
