pragma solidity 0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ProposalsHub {
    struct proposal {
        uint256 id;
        bytes32 solutionId;
        address collateralToken;
        uint256 funding;
        uint256 fundingGoal;
        mapping(address => uint256) funderAmount;
    }

    mapping(bytes32 => proposal) private proposals;

    function fundProposal(
        bytes32 _proposalId,
        IERC20 _token,
        uint256 _amount
    ) external {
        require(proposals[_proposalId].id != 0, "Proposal does not exist");
        require(
            proposals[_proposalId].collateralToken == address(_token),
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
            proposals[_proposalId].collateralToken == address(_token),
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
