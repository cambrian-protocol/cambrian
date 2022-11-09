// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.14;

import "../solvers/SolverLib.sol";

interface ISolverFactory {
    function createSolver(
        address chainParent,
        uint256 chainIndex,
        SolverLib.Config calldata solverConfig
    ) external returns (address);

    function ctf() external view returns (address);

    function erc1155Rescue() external view returns (address);
}
