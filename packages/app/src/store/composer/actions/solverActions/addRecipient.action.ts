import { ComposerStateType } from '../../composer.types'
import { SelectedRecipientAddressType } from '@cambrian/app/components/selects/SelectRecipient'
import { addCallbackToTargetIncomingCallbacks } from './createSlot.action'
import { isSlot } from '@cambrian/app/utils/helpers/slotHelpers'

const addRecipientAction = (
    state: ComposerStateType,
    payload: SelectedRecipientAddressType
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
            throw new Error('Error finding current Solver')
        }

        if (payload.value === 'Keeper' || payload.value === 'Arbitrator') {
            const propKey =
                payload.value === 'Keeper'
                    ? 'keeperAddress'
                    : 'arbitratorAddress'

            const sourceEntity = updatedSolvers.find(
                (x) => x.id === payload.solverId
            )?.config[propKey]

            if (!sourceEntity?.address) {
                throw new Error('No address found in sourceEntity')
            }
            const newSlot = currentSolver.addRecipient(
                payload.value,
                sourceEntity.address,
                null,
                undefined,
                { type: payload.value, solverId: payload.solverId }
            )

            // Link Entity to new slot
            if (!sourceEntity?.linkedSlots.find((x) => x === newSlot.id)) {
                sourceEntity?.linkedSlots.push(newSlot.id)
            }
        } else if (isSlot(payload.value)) {
            // Did i receive a Slot or a Solver as recipient?
            // Slot received - Create a callback slot

            const newSlot = currentSolver.addRecipient(
                'Callback',
                payload.value,
                payload.solverId
            )

            addCallbackToTargetIncomingCallbacks(
                newSlot,
                currentSolver.id,
                updatedSolvers
            )
        } else {
            // Solver received - Create a function slot

            currentSolver.addRecipient(
                'Solver',
                payload.value.id,
                payload.value.id
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

export default addRecipientAction
