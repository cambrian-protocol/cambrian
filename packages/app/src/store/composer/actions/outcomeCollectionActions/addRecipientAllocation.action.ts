import { ComposerSlotModel } from '@cambrian/app/models/SlotModel'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { SelectRecipientType } from '@cambrian/app/components/selects/SelectRecipient'
import { SlotType } from '@cambrian/app/models/SlotType'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import { isSlot } from '@cambrian/app/utils/helpers/slotHelpers'
import { SlotTagModel } from '@cambrian/app/src/classes/Tags/SlotTag'

const addRecipientAllocationAction = (
    state: CompositionModel,
    payload: SlotTagModel &
        SelectRecipientType & { amount: ComposerSlotModel | number }
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
        if (!currentSolver || !payload.reference) {
            throw new Error(
                'Error finding current Solver or retreiving slot reference data'
            )
        }
        const newRecipientSlot = currentSolver.addRecipientReference(
            payload.reference
        )

        currentSolver.addSlotTag({
            slotId: newRecipientSlot.id,
            label: payload.label,
            description: payload.description,
            instruction: payload.instruction,
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

export default addRecipientAllocationAction
