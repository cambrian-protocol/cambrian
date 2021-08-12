// SPDX-License-Identifier: GPL-3.0-or-Collateral
/* solhint-disable space-after-comma */
pragma solidity 0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./ConditionalTokens.sol";
import "./Solver.sol";
import "./Minion.sol";

contract SolverFactory {
    Solver[] public solverAddresses;
    mapping(address => Solver) solverMap;

    event SolverCreated(Solver solver);

    // TODO require msg.sender is a solutionsHub?

    function createSolver(
        ConditionalTokens _conditionalTokens,
        bytes32 _solutionId,
        address _proposalsHub,
        address _keeper,
        address _arbiter,
        uint256 _timelockHours,
        Minion.Action[] calldata _actions,
        bytes memory _data
    ) external returns (address _solver) {
        Solver solver = new Solver({
            _conditionalTokens: _conditionalTokens,
            _solutionId: _solutionId,
            _proposalsHub: _proposalsHub,
            _solutionsHub: msg.sender,
            _keeper: _keeper,
            _arbiter: _arbiter,
            _timelockHours: _timelockHours,
            _actions: _actions,
            _data: _data
        });

        solverAddresses.push(solver);
        solverMap[address(solver)] = solver;
        emit SolverCreated(solver);

        return address(solver);
    }
}
