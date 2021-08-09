pragma solidity 0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./ConditionalTokens.sol";
import "./SolverFactory.sol";
import "./interfaces/ISolutionsHub.sol";

contract ProposalsHub {
    uint256 nonce;

    struct Proposal {
        bool configured;
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

    mapping(bytes32 => Proposal) public proposals;

    function executeProposal(bytes32 _proposalId) external {
        require(
            proposals[_proposalId].funding ==
                proposals[_proposalId].fundingGoal,
            "Proposal not fully funded"
        );
        ISolutionsHub _solutionsHub = ISolutionsHub(
            proposals[_proposalId].solutionsHub
        );

        _solutionsHub.executeSolution(
            _proposalId,
            proposals[_proposalId].solutionId
        );
    }

    function approveERC20Transfer(bytes32 _proposalId, address _solver)
        external
    {
        require(
            msg.sender == proposals[_proposalId].solutionsHub,
            "msg.sender not solutionsHub"
        );

        IERC20 _token = IERC20(proposals[_proposalId].collateralToken);
        _token.approve(_solver, 0);
        _token.approve(_solver, proposals[_proposalId].funding);
    }

    function createProposal(
        IERC20 _collateralToken,
        address _solutionsHub,
        address _keeper,
        uint256 _fundingGoal,
        bytes32 _solutionId
    ) public {
        bytes32 _proposalId = keccak256(
            abi.encodePacked(
                msg.sender,
                _solutionId,
                _collateralToken,
                _keeper,
                _fundingGoal,
                nonce
            )
        );

        nonce += 1;

        Proposal storage proposal = proposals[_proposalId];
        proposal.configured = false;
        proposal.collateralToken = _collateralToken;
        proposal.proposer = msg.sender;
        proposal.solutionsHub = _solutionsHub;
        proposal.id = _proposalId;
        proposal.solutionId = _solutionId;
        proposal.fundingGoal = _fundingGoal;
    }

    function fundProposal(
        bytes32 _proposalId,
        IERC20 _token,
        uint256 _amount
    ) external {
        require(proposals[_proposalId].id != 0, "Proposal does not exist");
        require(
            proposals[_proposalId].collateralToken == _token,
            "Proposal does not include this token to be funded"
        );
        require(_amount > 0, "Amount cannot be zero");
        require(
            _amount + proposals[_proposalId].funding <=
                proposals[_proposalId].fundingGoal,
            "Can't fund more than goal"
        );

        proposals[_proposalId].funding += _amount;
        proposals[_proposalId].funderAmount[msg.sender] += _amount;
        _token.transferFrom(msg.sender, address(this), _amount);
    }

    function defundProposal(
        bytes32 _proposalId,
        IERC20 _token,
        uint256 _amount
    ) external {
        require(proposals[_proposalId].id != 0, "Proposal does not exist");
        require(
            proposals[_proposalId].collateralToken == _token,
            "Proposal does not include this token to be funded"
        );
        require(_amount > 0, "Amount cannot be zero");
        require(
            _amount <= proposals[_proposalId].funderAmount[msg.sender],
            "Committed funds is lower than amount."
        );

        proposals[_proposalId].funding -= _amount;
        proposals[_proposalId].funderAmount[msg.sender] -= _amount;

        _token.transferFrom(address(this), msg.sender, _amount);
    }
}
