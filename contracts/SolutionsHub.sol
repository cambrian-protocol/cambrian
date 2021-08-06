pragma solidity 0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./SolverFactory.sol";

contract SolutionsHub {
    struct Action {
        uint256 value;
        address to;
        bool executed;
        bytes data;
    }

    struct SolverConfig {
        SolverFactory factory;
        address keeper;
        address arbiter;
        address parentCollectionId;
        uint256 outcomeSlots;
        uint256 amount;
        uint256 timelockHours;
        bytes data;
        Action[] actions;
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
                _data: _solution.solverConfigs[i].data
            });
        }
    }
}
