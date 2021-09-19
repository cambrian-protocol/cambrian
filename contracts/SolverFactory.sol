pragma solidity 0.8.0;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./ConditionalTokens.sol";
import "./Solver.sol";

contract SolverFactory {
    address public immutable implementationAddress;
    Solver[] public solvers;

    event SolverCreated(address newSolverAddress);

    constructor() {
        implementationAddress = address(new Solver());
    }

    function createSolver(
        IERC20 _collateralToken,
        bytes32 _solutionId,
        bytes32 _proposalId,
        address _proposalsHub,
        address _solutionsHub,
        Solver.Config calldata _solverConfig
    ) external returns (address) {
        Solver clone = Solver(Clones.clone(implementationAddress));

        Solver(clone).init(
            _collateralToken,
            _solutionId,
            _proposalId,
            _proposalsHub,
            _solutionsHub,
            _solverConfig
        );

        solvers.push(clone);
        return address(clone);
    }
}
