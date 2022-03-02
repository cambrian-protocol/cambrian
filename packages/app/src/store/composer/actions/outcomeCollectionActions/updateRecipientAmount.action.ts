import {
    ComposerSlotModel,
    SlotPath,
    SlotTypes,
} from '@cambrian/app/models/SlotModel'

import { ComposerStateType } from '../../composer.types'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import { isSlot } from '@cambrian/app/utils/helpers/slotHelpers'

const updateRecipientAmountAction = (
    state: ComposerStateType,
    payload: {
        recipient: SlotPath
        amount: ComposerSlotModel | number
    }
): ComposerStateType => {
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
            currentSolver.updateRecipientAmount(
                state.currentIdPath.ocId,
                payload.recipient.slotId,
                payload.amount.id
            )
        } else {
            const newAmountSlot = currentSolver.addSlot({
                data: [payload.amount],
                slotType: SlotTypes.Constant,
                dataTypes: [SolidityDataTypes.Uint256],
            })
            currentSolver.updateRecipientAmount(
                state.currentIdPath.ocId,
                payload.recipient.slotId,
                newAmountSlot.id
            )
        }

        return { ...state, solvers: updatedSolvers }
    }
    console.error('No Outcome Collection selected')
    return state
}

export default updateRecipientAmountAction
