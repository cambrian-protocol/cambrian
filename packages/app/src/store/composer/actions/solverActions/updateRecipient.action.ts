import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { RecipientFormType } from '@cambrian/app/ui/composer/controls/solver/recipientList/forms/RecipientConfigForm'
import { SlotTagFormInputType } from '@cambrian/app/ui/composer/controls/solver/general/forms/SlotTagForm'

const updateRecipientAction = (
    state: CompositionModel,
    payload: {
        slotId: string
        recipientData: RecipientFormType
        slotTag: SlotTagFormInputType
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
            description: payload.slotTag.description,
            label: payload.slotTag.label,
            isFlex: payload.slotTag.isFlex,
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
