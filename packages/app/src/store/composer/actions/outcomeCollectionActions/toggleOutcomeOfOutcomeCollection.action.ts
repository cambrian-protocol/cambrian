import { ComposerStateType } from '../../composer.types'
import { OutcomeModel } from '@cambrian/app/models/OutcomeModel'
import _ from 'lodash'

const toggleOutcomeOfOutcomeCollectionAction = (
    state: ComposerStateType,
    outcome: OutcomeModel
): ComposerStateType => {
    if (
        state.currentIdPath !== undefined &&
        state.currentIdPath.solverId !== undefined &&
        state.currentIdPath.ocId !== undefined &&
        !isNaN(state.currentIdPath.solverId.length) &&
        !isNaN(state.currentIdPath.ocId.length)
    ) {
        const updatedSolvers = [...state.solvers]
        const currentSolver = updatedSolvers.find(
            (x) => x.id === state.currentIdPath?.solverId
        )
        if (!currentSolver) {
            throw new Error('Error finding current Solver')
        }

        currentSolver.toggleOutcome(state.currentIdPath.ocId, outcome.id)

        return { ...state, solvers: updatedSolvers }
    }
    console.error('No Solver selected')
    return state
}

export default toggleOutcomeOfOutcomeCollectionAction
