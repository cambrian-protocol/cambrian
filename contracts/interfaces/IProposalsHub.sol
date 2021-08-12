pragma solidity 0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

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

    function executeProposal(bytes32 _proposalId) external;

    function approveERC20Transfer(bytes32 _proposalId, address _solver)
        external;

    function createProposal(
        IERC20 _collateralToken,
        address _solutionsHub,
        uint256 _fundingGoal,
        bytes32 _solutionId
    ) external;

    function fundProposal(
        bytes32 _proposalId,
        IERC20 _token,
        uint256 _amount
    ) external;

    function defundProposal(
        bytes32 _proposalId,
        IERC20 _token,
        uint256 _amount
    ) external;

    function isProposal(bytes32 _id) external view returns (bool);
}
