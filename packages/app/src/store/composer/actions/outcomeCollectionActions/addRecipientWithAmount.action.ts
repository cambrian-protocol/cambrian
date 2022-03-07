import { ComposerSlotModel } from '@cambrian/app/models/SlotModel'
import { SlotType } from '@cambrian/app/models/SlotType'
import { isSlot } from '@cambrian/app/utils/helpers/slotHelpers'

import { ComposerStateType } from '../../composer.types'
import { SelectedRecipientAddressType } from '@cambrian/app/components/selects/SelectRecipient'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import { addCallbackToTargetIncomingCallbacks } from '../solverActions/createSlot.action'

// TODO DRY with addRecipientAction
const addRecipientWithAmountAction = (
    state: ComposerStateType,
    payload: {
        recipient: SelectedRecipientAddressType
        amount: number | ComposerSlotModel
    }
): ComposerStateType => {
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

        let newRecipientSlot = <ComposerSlotModel>{}
        if (
            payload.recipient.value === 'Keeper' ||
            payload.recipient.value === 'Arbitrator'
        ) {
            const propKey =
                payload.recipient.value === 'Keeper'
                    ? 'keeperAddress'
                    : 'arbitratorAddress'

            const sourceEntity = updatedSolvers.find(
                (x) => x.id === payload.recipient.solverId
            )?.config[propKey]

            if (!sourceEntity?.address) {
                throw new Error('No address found in sourceEntity')
            }

            newRecipientSlot = currentSolver.addRecipient({
                type: payload.recipient.value,
                data: sourceEntity.address,
                description: '',
                label: '',
                solverConfigAdress: {
                    type: payload.recipient.value,
                    solverId: payload.recipient.solverId,
                },
            })

            // Link Entity to new slot
            if (
                !sourceEntity?.linkedSlots.find(
                    (x: string) => x === newRecipientSlot.id
                )
            ) {
                sourceEntity?.linkedSlots.push(newRecipientSlot.id)
            }
        } else if (isSlot(payload.recipient.value)) {
            // Did i receive a Slot or a Solver as recipient?
            // Constant slot received - Create a callback slot

            newRecipientSlot = currentSolver.addRecipient({
                type: 'Callback',
                data: payload.recipient.value.id,
                targetSolverId: payload.recipient.solverId,
                label: '',
                description: '',
            })

            addCallbackToTargetIncomingCallbacks(
                newRecipientSlot,
                currentSolver.id,
                updatedSolvers
            )
        } else {
            // Solver received - Create a function slot

            newRecipientSlot = currentSolver.addRecipient({
                type: 'Solver',
                data: payload.recipient.value.id,
                targetSolverId: payload.recipient.value.id,
                label: '',
                description: '',
            })
        }

        if (isSlot(payload.amount)) {
            currentSolver.updateRecipientAmount(
                state.currentIdPath.ocId,
                newRecipientSlot.id,
                payload.amount.id
            )
        } else {
            const newAmountSlot = currentSolver.addSlot({
                data: [payload.amount],
                slotType: SlotType.Constant,
                dataTypes: [SolidityDataTypes.Uint256],
                label: '',
                description: '',
            })
            currentSolver.updateRecipientAmount(
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

export default addRecipientWithAmountAction
