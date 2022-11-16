import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { CreateRecipientFormType } from '@cambrian/app/ui/composer/controls/solver/recipientList/forms/CreateRecipientForm'

const createRecipientAction = (
    state: CompositionModel,
    payload: CreateRecipientFormType
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

        const newRecipientSlot = currentSolver.createRecipient(payload.address)
        currentSolver.addSlotTag({
            slotId: newRecipientSlot.id,
            label: payload.label,
            description: payload.description,
            instruction: payload.instruction,
            isFlex: payload.isFlex,
        })

        return {
            ...state,
            solvers: updatedSolvers,
        }
    }
    console.error('No Solver selected')
    return state
}

export default createRecipientAction
