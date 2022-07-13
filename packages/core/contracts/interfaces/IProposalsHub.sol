pragma solidity ^0.8.14;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../solvers/SolverLib.sol";
import "../hubs/ProposalsHub.sol";
import "./IIPFSSolutionsHub.sol";

interface IProposalsHub {
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

    function createIPFSSolutionAndProposal(
        bytes32 solutionId,
        IERC20 collateralToken,
        IIPFSSolutionsHub ipfsSolutionsHub,
        uint256 fundingGoal,
        SolverLib.Config[] calldata solverConfigs,
        string calldata solverConfigsURI,
        string calldata metadataCID
    ) external returns (bytes32 solutionID, bytes32 proposalID);

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

    function getMetadataCID(bytes32 id) external view returns (string memory);

    function isProposal(bytes32 id) external view returns (bool);

    function getProposal(bytes32 id)
        external
        view
        returns (ProposalsHub.Proposal memory proposal);

    function transferERC20(bytes32 proposalId, address solver) external;

    function reclaimTokens(bytes32 proposalId, uint256 tokenId) external;
}
