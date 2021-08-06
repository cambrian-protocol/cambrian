pragma solidity 0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./ConditionalTokens.sol";
import "./SolverFactory.sol";

contract ProposalsHub {
    uint256 nonce;

    struct Proposal {
        bool configured;
        IERC20 collateralToken;
        address proposer;
        bytes32 id;
        bytes32 solutionId;
        uint256 funding;
        uint256 fundingGoal;
        mapping(address => uint256) funderAmount;
    }

    mapping(bytes32 => Proposal) public proposals;

    function createProposal(
        IERC20 _collateralToken,
        address _keeper,
        uint256 _fundingGoal,
        bytes32 _solutionId
    ) public {
        bytes32 _proposalId = keccak256(
            abi.encodePacked(
                msg.sender,
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

    function onERC1155Received(
        address operator,
        address from,
        uint256 id,
        uint256 value,
        bytes calldata data
    ) external pure returns (bytes4) {
        return this.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(
        address operator,
        address from,
        uint256[] calldata ids,
        uint256[] calldata values,
        bytes calldata data
    ) external pure returns (bytes4) {
        return this.onERC1155BatchReceived.selector;
    }
}
