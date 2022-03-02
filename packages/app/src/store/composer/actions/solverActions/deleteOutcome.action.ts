import { ComposerStateType } from '../../composer.types'
import { OutcomeModel } from '@cambrian/app/models/OutcomeModel'

const deleteOutcomeAction = (
    state: ComposerStateType,
    outcome: OutcomeModel
): ComposerStateType => {
    if (
        state.currentIdPath !== undefined &&
        state.currentIdPath.solverId !== undefined &&
        state.currentIdPath.solverId.length
    ) {
        const updatedSolver = [...state.solvers]
        const currentSolver = updatedSolver.find(
            (x) => x.id === state.currentIdPath?.solverId
        )
        if (!currentSolver) {
            throw new Error('currentSolver is undefined')
        }

        currentSolver.deleteOutcome(outcome.id)

        return { ...state, solvers: updatedSolver }
    }
    console.error('No Solver selected')
    return state
}

export default deleteOutcomeAction
