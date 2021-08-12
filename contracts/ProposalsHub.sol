pragma solidity 0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./ConditionalTokens.sol";
import "./SolverFactory.sol";
import "./interfaces/ISolutionsHub.sol";

contract ProposalsHub {
    uint256 nonce;

    struct Proposal {
        IERC20 collateralToken;
        address proposer;
        address solutionsHub;
        address primeSolver;
        bytes32 id;
        bytes32 solutionId;
        uint256 funding;
        uint256 fundingGoal;
    }

    mapping(bytes32 => mapping(address => uint256)) funderAmountMap;

    mapping(bytes32 => Proposal) public proposals;

    event CreateProposal(bytes32 id);

    function executeProposal(bytes32 _proposalId) external {
        require(
            proposals[_proposalId].funding ==
                proposals[_proposalId].fundingGoal,
            "Proposal not fully funded"
        );

        ISolutionsHub(proposals[_proposalId].solutionsHub).executeSolution(
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
        require(_solver != address(0), "Invalid address");

        ISolutionsHub _solutionsHub = ISolutionsHub(
            proposals[_proposalId].solutionsHub
        );
        require(
            _solutionsHub.solverFromIndex(
                proposals[_proposalId].solutionId,
                0
            ) == _solver,
            "Incorrect solver address"
        );

        IERC20 _token = IERC20(proposals[_proposalId].collateralToken);
        _token.approve(_solver, 0);
        _token.approve(_solver, proposals[_proposalId].funding);
    }

    function createProposal(
        IERC20 _collateralToken,
        address _solutionsHub,
        uint256 _fundingGoal,
        bytes32 _solutionId
    ) external {
        bytes32 _proposalId = keccak256(
            abi.encodePacked(
                msg.sender,
                _solutionId,
                _collateralToken,
                _fundingGoal,
                nonce
            )
        );

        nonce++;

        Proposal storage proposal = proposals[_proposalId];
        proposal.collateralToken = _collateralToken;
        proposal.proposer = msg.sender;
        proposal.solutionsHub = _solutionsHub;
        proposal.id = _proposalId;
        proposal.solutionId = _solutionId;
        proposal.fundingGoal = _fundingGoal;

        ISolutionsHub(_solutionsHub).linkToProposal(_proposalId, _solutionId);
        emit CreateProposal(_proposalId);
    }

    function isProposal(bytes32 _id) external view returns (bool) {
        return proposals[_id].id != bytes32(0);
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
        funderAmountMap[_proposalId][msg.sender] += _amount;

        require(
            _token.transferFrom(msg.sender, address(this), _amount),
            "Could not transfer from msg.sender"
        );
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
            _amount <= funderAmountMap[_proposalId][msg.sender],
            "Committed funds is lower than amount."
        );

        proposals[_proposalId].funding -= _amount;
        funderAmountMap[_proposalId][msg.sender] -= _amount;

        _token.transferFrom(address(this), msg.sender, _amount);
    }

    function getProposal(bytes32 _id)
        external
        view
        returns (Proposal memory proposal)
    {
        return proposals[_id];
    }
}
