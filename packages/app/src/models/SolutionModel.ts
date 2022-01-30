import { ParticipantModel } from './ParticipantModel'
import { TokenModel } from './TokenModel'

// WIP
export type SolutionModel = {
    id: string
    isExecuted: boolean
    seller: ParticipantModel
    collateralToken: TokenModel
    keeper: string
    proposalsHub: string
    proposalId: string
    solverConfigsHash: string
    solverConfigsCID: string
    solverAddresses: string[]
}
