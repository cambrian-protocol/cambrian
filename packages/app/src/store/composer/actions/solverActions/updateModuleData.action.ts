import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { SolverModuleInputType } from '@cambrian/app/ui/composer/controls/solver/general/ComposerSolverModuleInputControl'
import _ from 'lodash'

const updateModuleDataAction = (
    state: CompositionModel,
    payload: SolverModuleInputType[]
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

        currentSolver.updateModuleLoader(payload)

        return {
            ...state,
            solvers: updatedSolvers,
        }
    }
    console.error('No Solver selected')
    return state
}

export default updateModuleDataAction
