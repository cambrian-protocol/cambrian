// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.14;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../conditionalTokens/ConditionalTokens.sol";
import "./Solver.sol";
import "./SolverLib.sol";

contract SolverFactory {
    address immutable ctfAddress; // Conditional token framework address
    address[] public solvers;

    event SolverCreated(address newSolverAddress);

    constructor(address _ctfAddress) {
        ctfAddress = _ctfAddress;
    }

    /**
        @notice Deploys Solver clone and calls init function
        @param chainParent Parent solver, or address(0)
        @param chainIndex Index of solver in its chain
        @param solverConfig Solver configuration
    */
    function createSolver(
        address chainParent,
        uint256 chainIndex,
        SolverLib.Config calldata solverConfig
    ) external returns (address) {
        require(
            address(solverConfig.implementation) != address(0),
            "SolverFactory::Invalid implementation address"
        );
        require(
            (chainParent == address(0) && chainIndex == 0) ||
                (chainParent != address(0) && chainIndex > 0),
            "SolverFactory::Invalid chain parent/index"
        );

        address clone = Clones.clone(address(solverConfig.implementation));

        Solver(clone).init(
            msg.sender,
            ctfAddress,
            chainParent,
            chainIndex,
            solverConfig
        );

        solvers.push(clone);

        emit SolverCreated(clone);
        return clone;
    }
}
