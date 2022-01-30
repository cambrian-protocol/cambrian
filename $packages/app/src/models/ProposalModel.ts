import { ParticipantModel } from './ParticipantModel'
import { SolutionModel } from './SolutionModel'

// WIP
export type ProposalModel = {
    id: string
    title: string
    buyer: ParticipantModel
    description: string
    amount: number
    solution: SolutionModel

    /*   
    bool isExecuted;
    IERC20 collateralToken;
    address proposer;
    address solutionsHub;
    bytes32 id;
    bytes32 solutionId;
    uint256 funding;
    uint256 fundingGoal; 
    */
}
