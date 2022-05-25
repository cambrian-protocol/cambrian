// SPDX-License-Identifier: GPL-3.0

// pragma solidity ^0.8.13;

// import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Receiver.sol";

// import "./interfaces/ISolutionsHub.sol";
// import "./interfaces/IIPFSSolutionsHub.sol";
// import "./interfaces/IProposalsHub.sol";
// import "./interfaces/IConditionalTokens.sol";

// import "./ProposalsHub.sol";

// import "./SolverLib.sol";

// contract ProposalRepeater {
//     IProposalsHub public immutable proposalsHub;
//     uint256 nonce;

//     struct Repeater {
//         bool enabled; // do repeats
//         address controller; // can disable and enable repeaters
//         bytes32 id; // repeater id
//         bytes32 baseProposalId; // proposal to be repeated
//         uint256 funding;
//         uint256 interval; // seconds which must elapse before next repeat
//         uint256 maxRepeats; // 0 for unlimited
//         uint256[] canRepeatTime; // time when n+1 proposal can repeat
//         bytes32[] repeatedProposalIds; // ids of new "repeated" proposals
//     }

//     mapping(bytes32 => Repeater) public repeaters;
//     mapping(bytes32 => mapping(address => uint256)) public funderAmountMap;

//     event AddedRepeater(bytes32 indexed repeaterId, bytes32 baseProposalId);
//     event FundedRepeater(
//         bytes32 indexed repeaterId,
//         uint256 amount,
//         address from
//     );
//     event DefundedRepeater(
//         bytes32 indexed repeaterId,
//         uint256 amount,
//         address to
//     );

//     constructor(IProposalsHub _proposalsHub) {
//         proposalsHub = _proposalsHub;
//     }

//     function addRepeater(
//         bytes32 baseProposalId,
//         uint256 interval,
//         uint256 maxRepeats,
//         bool allowImmediately
//     ) external returns (bytes32) {
//         nonce = nonce + 1;

//         require(proposalsHub.isProposal(baseProposalId), "Not a proposal");
//         require(interval > 0, "Interval cannot be 0");

//         Repeater memory repeater;
//         repeater.id = keccak256(abi.encodePacked(baseProposalId, nonce));

//         require(
//             repeaters[repeater.id].id != bytes32(""),
//             "Repeater already exists."
//         );

//         repeater.enabled = true;
//         repeater.interval = interval;
//         repeater.baseProposalId = baseProposalId;
//         repeater.maxRepeats = maxRepeats;
//         repeater.controller = msg.sender;

//         if (allowImmediately) {
//             repeater.canRepeatTime[0] = block.timestamp;
//         }

//         repeaters[repeater.id] = repeater;

//         emit AddedRepeater(repeater.id, baseProposalId);

//         return repeater.id;
//     }

//     function fundRepeater(
//         bytes32 repeaterId,
//         IERC20 token,
//         uint256 amount
//     ) external {
//         require(
//             repeaters[repeaterId].id != bytes32(""),
//             "Repeater does not exist"
//         );
//         require(repeaters[repeaterId].enabled, "Repeater is disabled");
//         require(amount > 0, "Amount cannot be zero");

//         ProposalsHub.Proposal memory baseProposal = proposalsHub.getProposal(
//             repeaters[repeaterId].baseProposalId
//         );

//         require(token == baseProposal.collateralToken, "Incorrect token");

//         uint256 beforeBalance = token.balanceOf(address(this));

//         require(
//             token.transferFrom(msg.sender, address(this), amount),
//             "Could not transfer from msg.sender"
//         );

//         require(
//             token.balanceOf(address(this)) - beforeBalance == amount,
//             "Incorrect balance after transfer"
//         );

//         repeaters[repeaterId].funding += amount;
//         funderAmountMap[repeaterId][msg.sender] += amount;

//         emit FundedRepeater(repeaterId, amount, msg.sender);
//     }

//     function defundRepeater(
//         bytes32 repeaterId,
//         IERC20 token,
//         uint256 amount
//     ) external {
//         require(
//             repeaters[repeaterId].id != bytes32(""),
//             "Repeater does not exist"
//         );
//         require(amount > 0, "Amount cannot be zero");
//         require(
//             amount <= repeaters[repeaterId].funding,
//             "Cannot defund more than total funding"
//         );

//         ProposalsHub.Proposal memory baseProposal = proposalsHub.getProposal(
//             repeaters[repeaterId].baseProposalId
//         );
//         require(token == baseProposal.collateralToken, "Incorrect token");

//         uint256 beforeBalance = token.balanceOf(address(this));

//         repeaters[repeaterId].funding -= amount;
//         funderAmountMap[repeaterId][msg.sender] -= amount;

//         require(token.transfer(msg.sender, amount), "Transfer failed");
//         require(
//             beforeBalance - token.balanceOf(address(this)) == amount,
//             "Before and after balance wrong"
//         );

//         emit DefundedRepeater(repeaterId, amount, msg.sender);
//     }

//     function executeIPFSRepeater(
//         bytes32 repeaterId,
//         SolverLib.Config[] calldata solverConfigs
//     ) external returns (bytes32 solutionId, bytes32 proposalId) {
//         require(
//             repeaters[repeaterId].id != bytes32(""),
//             "Repeater does not exist"
//         );
//         require(
//             block.timestamp >=
//                 repeaters[repeaterId].canRepeatTime[
//                     repeaters[repeaterId].canRepeatTime.length - 1
//                 ],
//             "Cannot repeat yet"
//         );

//         ProposalsHub.Proposal memory baseProposal = proposalsHub.getProposal(
//             repeaters[repeaterId].baseProposalId
//         );

//         require(
//             repeaters[repeaterId].funding >= baseProposal.fundingGoal,
//             "Not enough funding"
//         );

//         require(
//             IIPFSSolutionsHub(baseProposal.solutionsHub).verifyHash(
//                 baseProposal.solutionId,
//                 solverConfigs
//             ),
//             "Incorrect solverConfig hash"
//         );

//         IIPFSSolutionsHub.Solution memory baseSolution = IIPFSSolutionsHub
//             .getSolution(baseProposal.solutionId);

//         (solutionId, proposalId) = proposalsHub.createIPFSSolutionAndProposal(
//             keccak256(
//                 abi.encodePacked(
//                     repeaterId,
//                     repeaters[repeaterId].repeatedProposalIds.length
//                 )
//             ),
//             baseProposal.collateralToken,
//             baseProposal.solutionsHub,
//             baseProposal.fundingGoal,
//             solverConfigs,
//             baseProposal.solverConfigsCID,
//             baseProposal.metadataCID
//         );
//     }
// }
