pragma solidity 0.8.0;

import "../SolverLib.sol";

interface ISolverFactory {
    function createSolver(
        address chainParent,
        uint256 chainIndex,
        SolverLib.Config calldata solverConfig
    ) external returns (address);
}