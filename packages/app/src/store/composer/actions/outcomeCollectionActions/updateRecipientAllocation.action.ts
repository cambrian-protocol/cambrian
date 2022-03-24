import { ComposerSlotModel } from '@cambrian/app/models/SlotModel'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { SlotType } from '@cambrian/app/models/SlotType'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import { isSlot } from '@cambrian/app/utils/helpers/slotHelpers'

const updateRecipientAllocationAction = (
    state: CompositionModel,
    payload: {
        recipientId: string
        amount: ComposerSlotModel | number
    }
): CompositionModel => {
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

        if (isSlot(payload.amount)) {
            currentSolver.updateRecipientAllocation(
                state.currentIdPath.ocId,
                payload.recipientId,
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
                payload.recipientId,
                newAmountSlot.id
            )
        }

        return { ...state, solvers: updatedSolvers }
    }
    console.error('No Outcome Collection selected')
    return state
}

export default updateRecipientAllocationAction
