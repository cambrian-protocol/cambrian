// pragma solidity ^0.8.0;

// import {
//     ConditionalTokensInterface
// } from "./interfaces/ConditionalTokensInterface.sol";
// import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

// // Local ConditionalTokens address = 0x5FbDB2315678afecb367f032d93F642f64180aa3

// contract SolutionManager {
//     ConditionalTokensInterface CT =
//         ConditionalTokensInterface(0x5FbDB2315678afecb367f032d93F642f64180aa3);

//     constructor() {}

//     // MODIFIERS

//     modifier onlyWarden(bytes32 questionId, address warden) {
//         require(
//             questions[questionId].warden == warden,
//             "msg.sender must be the Warren of the Solution containing this Question"
//         );
//         _;
//     }

//     modifier onlySolver(bytes32 questionId, address solver) {
//         require(
//             questions[questionId].solver == solver,
//             "msg.sender must be the Solver of given Solvable"
//         );
//         _;
//     }

//     // STRUCTS

//     struct Question {
//         address solver;
//         address keeper;
//         address warden;
//         bytes32 id;
//         bytes32 data;
//         uint256[] reportedOutcome;
//     }

//     // VARIABLES

//     mapping(bytes32 => Question) public questions;

//     // FUNCTIONS

//     /**
//     @dev This function commissions a Solver for a question.
//     @param solver The solver being commissioned
//     @param keeper The keeper for the solver
//     @param warden The warden for the Solution
//     @param solutionId The ID of the Solution
//     @param data Solver-specific Data
//      */
//     function askQuestion(
//         address solver,
//         address keeper,
//         address warden,
//         bytes32 solutionId,
//         bytes32 calldata data
//     ) external {
//         bytes32 _questionId =
//             keccak256(abi.encodePacked(solver, keeper, warden, solutionId));
//         uint256[] memory _outcomes;

//         questions[_questionId] = Question(
//             solver,
//             keeper,
//             warden,
//             _questionId,
//             data,
//             _outcomes
//         );
//     }

//     /**
//     @dev This function reports outcomes for a questionId for later confirmation.
//     @param questionId The questionId being reported.
//     @param outcomes The outcomes being reported.
//      */
//     function reportOutcomes(bytes32 questionId, uint256[] calldata outcomes)
//         external
//         onlySolver(questionId, msg.sender)
//     {
//         questions[questionId].reportedOutcome = outcomes;
//     }

//     /**
//     @dev This function confirms the outcome of a condition and reports payouts to the Conditional Token contract.
//     @param questionId The questionId being answered.
//      */
//     function confirmOutcomes(bytes32 questionId)
//         external
//         onlyWarden(questionId, msg.sender)
//     {
//         CT.reportPayouts(questionId, questions[questionId].reportedOutcome);
//     }

//     function enactSolution(
//         address token,
//         address warden,
//         address solver,
//         uint256[] indexSetBudgets,
//         uint256[][] indexSets,
//         address[][] tokenRecipients
//     ) external {
//         for (uint256 i; i++; i < indexSets.length) {
//             // Create position with X funding for each set of indexSets and send tokens to recipients
//             for (uint256 j; j++; j < indexSets[i].length) {}
//         }
//     }

//     function readyPositions(
//         bytes32 questionId,
//         bytes32 parentCollectionId,
//         address oracle,
//         address collateralTokenAddress,
//         uint256 positionSlotCount,
//         uint256 amount,
//         uint256[] indexSets
//     ) {
//         IERC20 collateralToken = IERC20(collateralTokenAddress);
//         require(amount > 0, "Amount must be greater than zero");
//         require(
//             collateralToken.balanceOf(address(this)) >= amount,
//             "Solution is lacking enough collateral."
//         );

//         bytes32 conditionId =
//             CT.getConditionId(oracle, questionId, positionSlotCount);

//         CT.prepareCondition(oracle, questionId, positionSlotCount);

//         collateralToken.approve(address(CT), amount);
//         CT.splitPosition(
//             address(collateralToken),
//             parentCollectionId,
//             conditionId,
//             indexSets,
//             amount
//         );
//     }
// }
