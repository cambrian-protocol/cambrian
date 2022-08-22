// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.14;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Receiver.sol";

import "../interfaces/IIPFSSolutionsHub.sol";
import "../interfaces/IConditionalTokens.sol";

import "../solvers/SolverLib.sol";

contract ProposalsHub is ERC1155Receiver {
    // Used to allow funders to reclaim conditional tokens sent to this address
    IConditionalTokens public immutable conditionalTokens;

    // Increment for unique proposal IDs
    mapping(bytes32 => uint256) public nonces;

    struct Proposal {
        bool isExecuted;
        IERC20 collateralToken;
        address proposer;
        address solutionsHub;
        bytes32 id;
        bytes32 solutionId;
        uint256 funding;
        uint256 fundingGoal;
        string metadataURI;
    }

    mapping(bytes32 => Proposal) public proposals;
    mapping(bytes32 => mapping(address => uint256)) public funderAmountMap;

    // Used to allow funders to reclaim conditional tokens sent to this address
    mapping(bytes32 => mapping(uint256 => uint256)) public reclaimableTokens;
    mapping(uint256 => mapping(address => uint256)) public reclaimedTokens;

    event CreateProposal(bytes32 indexed id);
    event ExecuteProposal(bytes32 indexed id);
    event FundProposal(bytes32 indexed id, uint256 amount, address from);
    event DefundProposal(bytes32 indexed id, uint256 amount, address to);

    constructor(address _ctfAddress) {
        conditionalTokens = IConditionalTokens(_ctfAddress);
    }

    /**
        @dev Executes a proposal for Solutions where on the *hash* of solver configs is stored on-chain
        @param proposalId ID of proposal
        @param solverConfigs Configurations of Solvers to be run for the proposed solution
     */
    function executeIPFSProposal(
        bytes32 proposalId,
        SolverLib.Config[] calldata solverConfigs
    ) external {
        require(
            proposals[proposalId].funding >= proposals[proposalId].fundingGoal,
            "Proposal not fully funded"
        );
        require(
            proposals[proposalId].isExecuted == false,
            "ProposalsHub::Proposal already executed"
        );

        proposals[proposalId].isExecuted = true;

        IIPFSSolutionsHub(proposals[proposalId].solutionsHub).executeSolution(
            proposalId,
            proposals[proposalId].solutionId,
            solverConfigs
        );

        emit ExecuteProposal(proposalId);
    }

    /**
        @dev Called by SolutionsHub after deploying Solvers
        @param proposalId Proposal that collateral is being transferred from
        @param solver Solver receiving collateral
     */
    function transferERC20(bytes32 proposalId, address solver) external {
        require(
            msg.sender == proposals[proposalId].solutionsHub,
            "msg.sender not solutionsHub"
        );
        require(solver != address(0), "Invalid address");
        require(
            IIPFSSolutionsHub(proposals[proposalId].solutionsHub)
                .solverFromIndex(proposals[proposalId].solutionId, 0) == solver,
            "Incorrect solver address"
        );

        IERC20 _token = IERC20(proposals[proposalId].collateralToken);
        uint256 beforeBalance = _token.balanceOf(address(this));
        require(
            _token.transfer(solver, proposals[proposalId].funding),
            "Transfer failed"
        );
        require(
            beforeBalance - _token.balanceOf(address(this)) ==
                proposals[proposalId].fundingGoal,
            "Incorrect balance after transfer"
        );
    }

    /**
        @dev Creates a Proposal from an existing Solution.Base
        @param collateralToken ERC20 token being used as collateral for conditional tokens
        @param solutionsHub Address of the SolutionsHub contract managing the Solution
        @param fundingGoal Amount of ERC20 collateral requested for the Proposal
        @param safeBaseId ID of the Solution.Base for which a new instance and proposal is created
        @notice Ceramic Interop: safeBaseId == keccak256(abi.encode(keccak256(abi.encode(templateCommitID, proposalCommitID)), nonce))
    */
    function createProposal(
        IERC20 collateralToken,
        address solutionsHub,
        uint256 fundingGoal,
        bytes32 safeBaseId,
        SolverLib.Config[] memory solverConfigs,
        string calldata metadataURI
    ) public returns (bytes32 solutionId, bytes32 proposalId) {
        require(
            IIPFSSolutionsHub(solutionsHub).verifyHash(
                safeBaseId,
                solverConfigs
            ),
            "Incorrect Solver Configs"
        );

        nonces[safeBaseId]++; // Prevents DOS by frontrunning safeBaseId

        proposalId = keccak256(
            abi.encode(safeBaseId, metadataURI, nonces[safeBaseId])
        );

        solutionId = IIPFSSolutionsHub(solutionsHub).createInstance(safeBaseId);

        Proposal storage proposal = proposals[proposalId];
        proposal.id = proposalId;

        IIPFSSolutionsHub(solutionsHub).linkToProposal(
            proposalId,
            solutionId,
            collateralToken
        );

        proposal.collateralToken = collateralToken;
        proposal.proposer = msg.sender;
        proposal.solutionsHub = solutionsHub;
        proposal.solutionId = solutionId;
        proposal.fundingGoal = fundingGoal;
        proposal.metadataURI = metadataURI;

        emit CreateProposal(proposalId);

        return (solutionId, proposalId);
    }

    function createIPFSSolutionAndProposal(
        bytes32 baseId,
        IERC20 collateralToken,
        IIPFSSolutionsHub ipfsSolutionsHub,
        uint256 fundingGoal,
        SolverLib.Config[] calldata solverConfigs,
        string calldata solverConfigsURI,
        string calldata metadataURI
    ) external returns (bytes32 solutionId, bytes32 proposalId) {
        bytes32 safeBaseId = ipfsSolutionsHub.createBase(
            baseId,
            collateralToken,
            solverConfigs,
            solverConfigsURI
        );

        (solutionId, proposalId) = createProposal(
            collateralToken,
            address(ipfsSolutionsHub),
            fundingGoal,
            safeBaseId,
            solverConfigs,
            metadataURI
        );
    }

    /**
        @dev Called by user to add funding to a Proposal
        @param proposalId ID of Proposal being funded
        @param token ERC20 token to be funded with
        @param amount Amount to be funded
    */
    function fundProposal(
        bytes32 proposalId,
        IERC20 token,
        uint256 amount
    ) external {
        require(proposals[proposalId].id != 0, "Proposal does not exist");
        require(
            proposals[proposalId].isExecuted == false,
            "ProposalsHub::Proposal already executed"
        );
        require(
            proposals[proposalId].collateralToken == token,
            "Proposal does not include this token to be funded"
        );
        require(amount > 0, "Amount cannot be zero");
        require(
            amount + proposals[proposalId].funding <=
                proposals[proposalId].fundingGoal,
            "Can't fund more than goal"
        );

        uint256 beforeBalance = token.balanceOf(address(this));
        require(
            token.transferFrom(msg.sender, address(this), amount),
            "Could not transfer from msg.sender"
        );
        require(
            token.balanceOf(address(this)) - beforeBalance == amount,
            "Incorrect balance after transfer"
        );

        proposals[proposalId].funding += amount;
        funderAmountMap[proposalId][msg.sender] += amount;

        emit FundProposal(proposalId, amount, msg.sender);
    }

    /**
        @dev Called by user to remove their funding from a Proposal
        @param proposalId ID of Proposal being defunded
        @param token ERC20 token to be defunded
        @param amount Amount to be defunded
    */
    function defundProposal(
        bytes32 proposalId,
        IERC20 token,
        uint256 amount
    ) external {
        require(proposals[proposalId].id != 0, "Proposal does not exist");
        require(
            proposals[proposalId].isExecuted == false,
            "ProposalsHub::Proposal already executed"
        );
        require(
            proposals[proposalId].collateralToken == token,
            "Proposal does not include this token to be funded"
        );
        require(amount > 0, "Amount cannot be zero");
        require(
            amount <= funderAmountMap[proposalId][msg.sender],
            "Committed funds is lower than amount."
        );
        uint256 beforeBalance = token.balanceOf(address(this));

        proposals[proposalId].funding -= amount;
        funderAmountMap[proposalId][msg.sender] -= amount;

        require(token.transfer(msg.sender, amount), "Transfer failed");

        require(
            beforeBalance - token.balanceOf(address(this)) == amount,
            "Before and after balance wrong"
        );

        emit DefundProposal(proposalId, amount, msg.sender);
    }

    function getProposal(bytes32 id)
        external
        view
        returns (Proposal memory proposal)
    {
        return proposals[id];
    }

    function getMetadataCID(bytes32 id) external view returns (string memory) {
        return proposals[id].metadataURI;
    }

    function isProposal(bytes32 id) external view returns (bool) {
        return proposals[id].id != bytes32(0);
    }

    /**
        @dev Called when contract receives ERC1155 with data referring to a proposalId
        @param proposalId ID of proposal being referred to by tx
        @param tokenId ID of ERC1155 token that was received
        @param amount Amount of token received
     */
    function postReclaimableTokens(
        bytes32 proposalId,
        uint256 tokenId,
        uint256 amount
    ) private {
        reclaimableTokens[proposalId][tokenId] += amount;
    }

    /**
        @dev Transfers reclaimable CTs to a claimer and lowers their reclaimable balance for that token
        @param proposalId ID of proposal being reclaimed from
        @param tokenId ERC1155 token being reclaimed
     */
    function reclaimTokens(bytes32 proposalId, uint256 tokenId) external {
        require(
            funderAmountMap[proposalId][msg.sender] > 0,
            "ProposalsHub::msg.sender has no claim"
        );
        uint256 _claimDenominator = proposals[proposalId].funding /
            funderAmountMap[proposalId][msg.sender];

        uint256 _claimAmount = (reclaimableTokens[proposalId][tokenId] /
            _claimDenominator) - reclaimedTokens[tokenId][msg.sender];
        require(_claimAmount > 0, "ProposalsHub::Claim is 0");
        require(
            _claimAmount <= reclaimableTokens[proposalId][tokenId],
            "ProposalsHub::Claim is too large"
        );
        reclaimedTokens[tokenId][msg.sender] += _claimAmount;

        conditionalTokens.safeTransferFrom(
            address(this),
            msg.sender,
            tokenId,
            _claimAmount,
            abi.encode(proposalId)
        );
    }

    /** 
        IMPORTANT!
        Any CTs sent to this contract are reclaimable by the funders in proportion to their funding.
        If a user reclaims CTs and sends them back again to this contract, they will only be able to 
        regain from them a fraction of their original funding.
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
