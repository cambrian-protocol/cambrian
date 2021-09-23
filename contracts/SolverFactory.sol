pragma solidity 0.8.0;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./ConditionalTokens.sol";
import "./Solver.sol";
import "./SolverLib.sol";

// 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512  DEV_ADDRESS
contract SolverFactory {
    Solver[] public solvers;

    event SolverCreated(address newSolverAddress);

    function createSolver(
        IERC20 _collateralToken,
        address _chainParent,
        uint256 _chainIndex,
        SolverLib.Config calldata _solverConfig
    ) external returns (address) {
        require(
            address(_solverConfig.implementation) != address(0),
            "SolverFactory::Invalid implementation address"
        );

        Solver clone = Solver(
            Clones.clone(address(_solverConfig.implementation))
        );
        Solver(clone).init(
            _collateralToken,
            _chainParent,
            _chainIndex,
            _solverConfig
        );
        solvers.push(clone);
        return address(clone);
    }
}
