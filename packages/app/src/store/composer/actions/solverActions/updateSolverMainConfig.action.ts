import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import _ from 'lodash'

export type SolverMainConfigType = {
    keeperAddress: string
    arbitratorAddress: string
    timelockSeconds: number
}

const updateSolverMainConfigAction = (
    state: CompositionModel,
    payload: SolverMainConfigType
): CompositionModel => {
    if (
        state.currentIdPath !== undefined &&
        state.currentIdPath.solverId !== undefined &&
        state.currentIdPath.solverId.length
    ) {
        const updatedSolvers = [...state.solvers]

        const currentSolver = updatedSolvers.find(
            (x) => x.id === state.currentIdPath?.solverId
        )
        if (!currentSolver) {
            throw new Error('currentSolver is undefined')
        }

        currentSolver.updateMainConfig(payload)

        return {
            ...state,
            solvers: updatedSolvers,
        }
    }
    console.error('No Solver selected')
    return state
}

export default updateSolverMainConfigAction
