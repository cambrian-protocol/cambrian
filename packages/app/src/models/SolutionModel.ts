import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { ParticipantModel } from './ParticipantModel'
import { SolverConfigModel } from './SolverConfigModel'
import { TokenModel } from './TokenModel'

export type SolutionModel = {
    id: string
    isExecuted: boolean
    seller: ParticipantModel
    collateralToken: TokenModel
    solverConfigsCID: string
    solverConfigs: SolverConfigModel[]
    proposalId: string
    finalComposition: CompositionModel
    solverAddresses: string[]
}
