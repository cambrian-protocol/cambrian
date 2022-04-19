pragma solidity 0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../SolverLib.sol";
import "../SolutionsHub.sol";

interface ISolutionsHub {
    function createSolution(
        bytes32 _id,
        IERC20 _collateralToken,
        SolverLib.Config[] calldata _solverConfigs
    ) external returns (bytes32 _solutionId);

    function linkToProposal(
        bytes32 proposalId,
        bytes32 solutionId,
        IERC20 collateralToken
    ) external;

    function executeSolution(bytes32 _proposalId, bytes32 _solutionId) external;

    function getSolution(bytes32 id)
        external
        view
        returns (SolutionsHub.Solution memory);

    function solverFromIndex(bytes32 _solutionId, uint256 _solverIndex)
        external
        view
        returns (address solver);

    function getSolvers(bytes32 _solutionId)
        external
        view
        returns (address[] memory solvers);
}
