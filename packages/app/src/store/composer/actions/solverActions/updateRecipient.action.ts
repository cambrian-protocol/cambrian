import { ComposerStateType } from '../../composer.types'
import { RecipientFormType } from '@cambrian/app/ui/composer/controls/solver/recipientList/forms/CreateRecipientForm'

const updateRecipientAction = (
    state: ComposerStateType,
    payload: {
        slotId: string
        recipientData: RecipientFormType
    }
): ComposerStateType => {
    if (
        state.currentIdPath !== undefined &&
        state.currentIdPath.solverId !== undefined &&
        state.currentIdPath.solverId.length
    ) {
        const updatedSolvers = [...state.solvers]
        const currentSolver = state.solvers.find(
            (x) => x.id === state.currentIdPath?.solverId
        )
        if (!currentSolver) {
            throw new Error('currentSolver is undefined')
        }

        currentSolver.updateRecipient(
            payload.slotId,
            payload.recipientData.address,
            payload.recipientData.description
        )

        return {
            ...state,
            solvers: updatedSolvers,
        }
    }
    console.error('No Solver selected')
    return state
}

export default updateRecipientAction
