pragma solidity ^0.8.13;

import "../solvers/SolverLib.sol";

interface ISolverFactory {
    function createSolver(
        address chainParent,
        uint256 chainIndex,
        SolverLib.Config calldata solverConfig
    ) external returns (address);
}
