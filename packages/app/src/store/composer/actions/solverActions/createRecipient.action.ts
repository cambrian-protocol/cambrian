import { ComposerStateType } from '../../composer.types'
import { RecipientFormType } from '@cambrian/app/ui/composer/controls/solver/recipientList/forms/RecipientConfigForm'
import { SlotTagFormInputType } from '@cambrian/app/ui/composer/controls/solver/general/forms/SlotTagForm'

const createRecipientAction = (
    state: ComposerStateType,
    payload: { recipientData: RecipientFormType; slotTag: SlotTagFormInputType }
): ComposerStateType => {
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

        const newRecipientSlot = currentSolver.addRecipient({
            type: 'Slot',
            data: payload.recipientData.address,
        })

        currentSolver.addSlotTag({
            slotId: newRecipientSlot.id,
            label: payload.slotTag.label,
            description: payload.slotTag.description,
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

export default createRecipientAction
