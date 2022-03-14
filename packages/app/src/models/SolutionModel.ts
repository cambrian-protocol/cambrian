import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { ParticipantModel } from './ParticipantModel'
import { TokenModel } from './TokenModel'

// WIP
export type SolutionModel = {
    id: string
    isExecuted: boolean
    seller: ParticipantModel
    collateralToken: TokenModel
    solverConfigsCID: string
    proposalId: string
    finalComposition: CompositionModel
    solverAddresses: string[]
}
