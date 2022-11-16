import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { CreateRecipientFormType } from '@cambrian/app/ui/composer/controls/solver/recipientList/forms/CreateRecipientForm'

const updateRecipientAction = (
    state: CompositionModel,
    payload: {
        slotId: string
        recipientData: CreateRecipientFormType
    }
): CompositionModel => {
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

        currentSolver.updateRecipient({
            id: payload.slotId,
            address: payload.recipientData.address,
        })

        currentSolver.updateSlotTag({
            slotId: payload.slotId,
            label: payload.recipientData.label,
            description: payload.recipientData.description,
            instruction: payload.recipientData.instruction,
            isFlex: payload.recipientData.isFlex,
        })

        return {
            ...state,
            solvers: updatedSolvers,
        }
    }
    console.error('No Solver selected')
    return state
}

export default updateRecipientAction
