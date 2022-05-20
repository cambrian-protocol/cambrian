// // SPDX-License-Identifier: GPL-3.0

// pragma solidity ^0.8.13;

// import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// import "../interfaces/IConditionalTokens.sol";
// import "../interfaces/ISolver.sol";

// import "../interfaces/ISolver.sol";
// import "../solvers/SolverLib.sol";

// import "../Module.sol";
// import "./Keeper.sol";

// contract Unanimity is Keeper {
//     function load(bytes calldata data) external override {}

//     function roles()
//         public
//         pure
//         override
//         returns (bytes32[] memory requestedRoles)
//     {
//         requestedRoles = new bytes32[](2);
//         requestedRoles[0] = keccak256("KEEPER_ROLE");
//         requestedRoles[1] = keccak256("TIME_WIZARD_ROLE");
//     }
// }
