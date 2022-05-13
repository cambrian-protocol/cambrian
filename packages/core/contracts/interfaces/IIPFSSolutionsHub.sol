pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../IPFSSolutionsHub.sol";
import "../SolverLib.sol";

interface IIPFSSolutionsHub {
    struct Solution {
        bool executed;
        IERC20 collateralToken;
        address proposalHub;
        bytes32 proposalId;
        bytes32 id;
        bytes32 solverConfigsHash;
        SolverLib.Multihash solverConfigsCID;
        address[] solverAddresses;
    }

    function createBase(
        bytes32 baseId,
        IERC20 collateralToken,
        SolverLib.Config[] calldata solverConfigs,
        SolverLib.Multihash calldata solverConfigsCID
    ) external;

    function createInstance(bytes32 baseId, bytes32 instanceId)
        external
        returns (bytes32 solutionId);

    function createSolution(
        bytes32 _id,
        IERC20 _collateralToken,
        SolverLib.Config[] calldata _solverConfigs,
        SolverLib.Multihash calldata _solverConfigsCID
    ) external returns (bytes32 _solutionId);

    function linkToProposal(
        bytes32 proposalId,
        bytes32 solutionId,
        IERC20 collateralToken
    ) external;

    function executeSolution(
        bytes32 _proposalId,
        bytes32 _solutionId,
        SolverLib.Config[] calldata solverConfigs
    ) external;

    function solverFromIndex(bytes32 _solutionId, uint256 _solverIndex)
        external
        view
        returns (address solver);

    function getSolvers(bytes32 _solutionId)
        external
        view
        returns (address[] memory solvers);

    function verifyHash(
        bytes32 solutionId,
        SolverLib.Config[] memory solverConfigs
    ) external view returns (bool);

    function getSolution(bytes32 id)
        external
        view
        returns (IPFSSolutionsHub.Solution memory);
}
