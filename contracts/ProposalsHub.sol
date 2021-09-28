pragma solidity 0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Receiver.sol";
import "./ConditionalTokens.sol";
import "./SolverFactory.sol";
import "./SolutionsHub.sol";

// 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9 DEV_ADDRESS
contract ProposalsHub is ERC1155Receiver {
    uint256 nonce;

    struct Proposal {
        bool isExecuted;
        IERC20 collateralToken;
        address proposer;
        address solutionsHub;
        address primeSolver;
        bytes32 id;
        bytes32 solutionId;
        uint256 funding;
        uint256 fundingGoal;
    }

    mapping(bytes32 => Proposal) public proposals;
    mapping(bytes32 => mapping(address => uint256)) public funderAmountMap;

    mapping(bytes32 => mapping(uint256 => uint256)) public reclaimableTokens;
    mapping(uint256 => mapping(address => uint256)) public reclaimedTokens;

    event CreateProposal(bytes32 id);

    function executeProposal(bytes32 _proposalId) external {
        require(
            proposals[_proposalId].funding ==
                proposals[_proposalId].fundingGoal,
            "Proposal not fully funded"
        );
        require(
            proposals[_proposalId].isExecuted == false,
            "ProposalsHub::Proposal already executed"
        );
        proposals[_proposalId].isExecuted = true;

        SolutionsHub(proposals[_proposalId].solutionsHub).executeSolution(
            _proposalId,
            proposals[_proposalId].solutionId
        );
    }

    function transferERC20(bytes32 _proposalId, address _solver) external {
        require(
            msg.sender == proposals[_proposalId].solutionsHub,
            "msg.sender not solutionsHub"
        );
        require(_solver != address(0), "Invalid address");

        SolutionsHub _solutionsHub = SolutionsHub(
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
        _token.transfer(_solver, proposals[_proposalId].funding);
    }

    function createProposal(
        IERC20 _collateralToken,
        address _solutionsHub,
        uint256 _fundingGoal,
        bytes32 _solutionId
    ) external {
        nonce++;

        bytes32 _proposalId = keccak256(
            abi.encodePacked(
                msg.sender,
                _solutionId,
                _collateralToken,
                _fundingGoal,
                nonce
            )
        );

        Proposal storage proposal = proposals[_proposalId];
        proposal.collateralToken = _collateralToken;
        proposal.proposer = msg.sender;
        proposal.solutionsHub = _solutionsHub;
        proposal.id = _proposalId;
        proposal.solutionId = _solutionId;
        proposal.fundingGoal = _fundingGoal;

        SolutionsHub(_solutionsHub).linkToProposal(_proposalId, _solutionId);
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
            proposals[_proposalId].isExecuted == false,
            "ProposalsHub::Proposal already executed"
        );
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
            proposals[_proposalId].isExecuted == false,
            "ProposalsHub::Proposal already executed"
        );
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

        _token.transfer(msg.sender, _amount);
    }

    function getProposal(bytes32 _id)
        external
        view
        returns (Proposal memory proposal)
    {
        return proposals[_id];
    }

    function postReclaimableTokens(
        bytes32 _proposalId,
        uint256 _tokenId,
        uint256 _amount
    ) private {
        reclaimableTokens[_proposalId][_tokenId] += _amount;
    }

    function reclaimTokens(bytes32 _proposalId, uint256 _tokenId) external {
        require(
            funderAmountMap[_proposalId][msg.sender] > 0,
            "ProposalsHub::msg.sender has no claim"
        );
        uint256 _claimDenominator = proposals[_proposalId].funding /
            funderAmountMap[_proposalId][msg.sender];

        uint256 _claimAmount = (reclaimableTokens[_proposalId][_tokenId] /
            _claimDenominator) - reclaimedTokens[_tokenId][msg.sender];
        require(_claimAmount > 0, "ProposalsHub::Claim is 0");
        require(
            _claimAmount <= reclaimableTokens[_proposalId][_tokenId],
            "ProposalsHub::Claim is too large"
        );
        reclaimedTokens[_tokenId][msg.sender] += _claimAmount;

        ConditionalTokens _conditionalTokens = SolutionsHub(
            proposals[_proposalId].solutionsHub
        ).conditionalTokens();

        _conditionalTokens.safeTransferFrom(
            address(this),
            msg.sender,
            _tokenId,
            _claimAmount,
            abi.encode(_proposalId)
        );
    }

    /** 
        IMPORTANT!
        Any CTs sent to this contract are reclaimable by the funders in proportion to their funding.
        If a user reclaims CTs and sends them back again to this contract, they will only be able
        to reclaim the same fraction of it.
    */
    function onERC1155Received(
        address operator,
        address from,
        uint256 id,
        uint256 value,
        bytes calldata data
    ) external virtual override returns (bytes4) {
        bytes32 _proposalId = abi.decode(data, (bytes32));
        require(
            proposals[_proposalId].id == _proposalId,
            "ProposalsHub::Data is not valid proposalId"
        );
        require(
            proposals[_proposalId].isExecuted,
            "ProposalsHub::Proposal has not been executed"
        );
        postReclaimableTokens(_proposalId, id, value);

        return this.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(
        address operator,
        address from,
        uint256[] calldata ids,
        uint256[] calldata values,
        bytes calldata data
    ) external virtual override returns (bytes4) {
        bytes32 _proposalId = abi.decode(data, (bytes32));
        require(
            proposals[_proposalId].id == _proposalId,
            "ProposalsHub::Data is not valid proposalId"
        );
        require(
            proposals[_proposalId].isExecuted,
            "ProposalsHub::Proposal has not been executed"
        );
        for (uint256 i; i < ids.length; i++) {
            postReclaimableTokens(_proposalId, ids[i], values[i]);
        }
        return this.onERC1155BatchReceived.selector;
    }
}
