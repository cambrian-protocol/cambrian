pragma solidity 0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../SolverFactory.sol";
import "../Minion.sol";

interface ISolutionsHub {
    struct SolverConfig {
        SolverFactory factory;
        address keeper;
        address arbiter;
        uint256 timelockHours;
        bytes data;
        Minion.Action[] actions;
    }

    function linkToProposal(bytes32 _proposalId, bytes32 _solutionId) external;

    function executeSolution(bytes32 _proposalId, bytes32 _solutionId) external;

    function solverFromIndex(bytes32 _solutionId, uint256 _index)
        external
        view
        returns (address solver);

    function createSolution() external returns (bytes32 _solutionId);

    function createSolution(SolverConfig[] calldata _solverConfigs) external;

    function setSolverConfigs(
        bytes32 _solutionId,
        SolverConfig[] calldata _solverConfigs
    ) external;

    function getSolution(bytes32 _id) external view;
}
