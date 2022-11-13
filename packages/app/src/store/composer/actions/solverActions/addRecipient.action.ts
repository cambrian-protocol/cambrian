import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { SelectedRecipientFormType } from '@cambrian/app/ui/composer/controls/solver/recipientList/forms/SelectRecipientForm'

const addRecipientAction = (
    state: CompositionModel,
    payload: SelectedRecipientFormType
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
            throw new Error('Error finding current Solver')
        }
        if (payload.reference) {
            const newSlot = currentSolver.addRecipientReference(
                payload.reference
            )
            currentSolver.addSlotTag({
                slotId: newSlot.id,
                label: payload.label,
                description: payload.description,
                instruction: payload.instruction,
                isFlex: payload.isFlex,
            })
        }

        return {
            ...state,
            solvers: updatedSolvers,
        }
    }
    console.error('No Solver selected')
    return state
}

export default addRecipientAction
