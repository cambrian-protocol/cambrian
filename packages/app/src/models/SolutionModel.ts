import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { MultihashType } from '../utils/helpers/multihash'
import { ParticipantModel } from './ParticipantModel'
import { SolverConfigModel } from './SolverConfigModel'
import { TokenModel } from './TokenModel'

export type SolutionModel = {
    id: string
    isExecuted: boolean
    seller: ParticipantModel
    collateralToken: TokenModel
    solverConfigsCID: MultihashType
    solverConfigs: SolverConfigModel[]
    proposalId: string
    finalComposition: CompositionModel
    solverAddresses: string[]
}
