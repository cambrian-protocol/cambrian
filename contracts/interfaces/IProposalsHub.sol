pragma solidity 0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../SolverLib.sol";

interface IProposalsHub {
    struct Proposal {
        IERC20 collateralToken;
        address proposer;
        address solutionsHub;
        address primeSolver;
        bytes32 id;
        bytes32 solutionId;
        uint256 funding;
        uint256 fundingGoal;
        mapping(address => uint256) funderAmount;
    }

    function executeProposal(bytes32 proposalId) external;

    function executeIPFSProposal(
        bytes32 proposalId,
        SolverLib.Config[] calldata solverConfigs
    ) external;

    function approveERC20Transfer(bytes32 proposalId, address solver) external;

    function createProposal(
        IERC20 collateralToken,
        address solutionsHub,
        uint256 fundingGoal,
        bytes32 solutionId
    ) external;

    function fundProposal(
        bytes32 proposalId,
        IERC20 token,
        uint256 amount
    ) external;

    function defundProposal(
        bytes32 proposalId,
        IERC20 token,
        uint256 amount
    ) external;

    function isProposal(bytes32 id) external view returns (bool);

    function transferERC20(bytes32 proposalId, address solver) external;

    function reclaimTokens(bytes32 proposalId, uint256 tokenId) external;
}
