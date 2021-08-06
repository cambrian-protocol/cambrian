pragma solidity 0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./SolverFactory.sol";
import "./Minion.sol";

contract SolutionsHub {
    struct SolverConfig {
        SolverFactory factory;
        address keeper;
        address arbiter;
        address parentCollectionId;
        uint256 outcomeSlots;
        uint256 amount;
        uint256 timelockHours;
        bytes data;
        Minion.Action[] actions;
    }

    struct Solution {
        bytes32 id;
        SolverConfig[] solverConfigs;
    }

    mapping(bytes32 => Solution) solutions;

    function executeSolution(bytes32 _solutionId) external {
        Solution memory _solution = solutions[_solutionId];

        for (uint256 i; i < _solution.solverConfigs.length; i++) {
            SolverFactory _factory = _solution.solverConfigs[i].factory;

            _factory.createSolver({
                _keeper: _solution.solverConfigs[i].keeper,
                _arbiter: _solution.solverConfigs[i].arbiter,
                _timelockHours: _solution.solverConfigs[i].timelockHours,
                _actions: _solution.solverConfigs[i].actions,
                _data: _solution.solverConfigs[i].data
            });
        }
    }
}
