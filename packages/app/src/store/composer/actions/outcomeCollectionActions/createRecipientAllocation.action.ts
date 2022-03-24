import { ComposerSlotModel } from '@cambrian/app/models/SlotModel'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { CreateRecipientFormType } from '@cambrian/app/ui/composer/controls/solver/recipientList/forms/CreateRecipientForm'
import { SlotType } from '@cambrian/app/models/SlotType'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import { isSlot } from '@cambrian/app/utils/helpers/slotHelpers'

const createRecipientAllocationAction = (
    state: CompositionModel,
    payload: CreateRecipientFormType & { amount: ComposerSlotModel | number }
): CompositionModel => {
    if (
        state.currentIdPath !== undefined &&
        state.currentIdPath.ocId !== undefined &&
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

        const newRecipientSlot = currentSolver.createRecipient(payload.address)

        currentSolver.addSlotTag({
            slotId: newRecipientSlot.id,
            label: payload.label,
            description: payload.description,
            isFlex: payload.isFlex,
        })

        if (isSlot(payload.amount)) {
            currentSolver.updateRecipientAllocation(
                state.currentIdPath.ocId,
                newRecipientSlot.id,
                payload.amount.id
            )
        } else {
            const newAmountSlot = currentSolver.addSlot({
                data: [payload.amount],
                slotType: SlotType.Constant,
                dataTypes: [SolidityDataTypes.Uint256],
            })
            currentSolver.updateRecipientAllocation(
                state.currentIdPath.ocId,
                newRecipientSlot.id,
                newAmountSlot.id
            )
        }

        return {
            ...state,
            solvers: updatedSolvers,
        }
    }
    console.error('No Solver selected')
    return state
}

export default createRecipientAllocationAction
