// SPDX-License-Identifier: GPL-3.0-or-Collateral
/* solhint-disable space-after-comma */
pragma solidity 0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./ConditionalTokens.sol";
import "./Solver.sol";

contract SolverFactory is Ownable {
    Solver[] public solverAddresses;
    mapping(address => Solver) solverMap;

    event SolverCreated(Solver solver);

    function createSolver(
        address _keeper,
        address _arbiter,
        uint256 _timelockHours,
        bytes memory _data
    ) external returns (address _solver) {
        Solver solver = new Solver(_keeper, _arbiter, _timelockHours, _data);

        solverAddresses.push(solver);
        solverMap[address(solver)] = solver;
        emit SolverCreated(solver);

        return address(solver);
    }
}
