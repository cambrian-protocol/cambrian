import { MultihashType } from '../utils/helpers/multihash'

export type SolutionModel = {
    id: string
    executed: boolean
    collateralToken: string
    proposalId: string
    proposalsHub: string
    solverConfigsHash: string
    solverConfigsCID: MultihashType
    solverAddresses: string[]
}
