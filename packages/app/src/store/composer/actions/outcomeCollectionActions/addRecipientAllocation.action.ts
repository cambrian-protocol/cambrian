import { ComposerSlotModel } from '@cambrian/app/models/SlotModel'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { SelectedRecipientAddressType } from '@cambrian/app/components/selects/SelectRecipient'
import { SlotType } from '@cambrian/app/models/SlotType'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import { isSlot } from '@cambrian/app/utils/helpers/slotHelpers'

// TODO DRY with addRecipientAction
const addRecipientAllocationAction = (
    state: CompositionModel,
    payload: {
        recipient: SelectedRecipientAddressType
        amount: number | ComposerSlotModel
    }
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

        const newRecipientSlot = currentSolver.addRecipientReference({
            solverId: payload.recipient.solverId,
            slotId: payload.recipient.value,
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

export default addRecipientAllocationAction
