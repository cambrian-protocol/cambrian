import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { OutcomeModel } from '@cambrian/app/models/OutcomeModel'

const createOutcomeAction = (
    state: CompositionModel,
    outcome: OutcomeModel
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

        currentSolver.addOutcome(
            outcome.title,
            outcome.description,
            outcome.uri
        )
        return { ...state, solvers: updatedSolvers }
    }
    console.error('No Solver selected')
    return state
}

export default createOutcomeAction
