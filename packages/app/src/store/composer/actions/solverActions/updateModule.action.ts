import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { ModuleModel } from '@cambrian/app/models/ModuleModel'
import _ from 'lodash'

const updateModuleAction = (
    state: CompositionModel,
    payload: ModuleModel
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

        currentSolver.updateModule(payload)

        return {
            ...state,
            solvers: updatedSolvers,
        }
    }
    console.error('No Solver selected')
    return state
}

export default updateModuleAction
