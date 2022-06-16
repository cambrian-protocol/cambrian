import { ComposerModuleModel } from '@cambrian/app/models/ModuleModel'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import _ from 'lodash'

const updateModuleAction = (
    state: CompositionModel,
    payload: ComposerModuleModel
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
