import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { SelectedRecipientAddressType } from '@cambrian/app/components/selects/SelectRecipient'
import { addCallbackToTargetIncomingCallbacks } from './createSlot.action'
import { isSlot } from '@cambrian/app/utils/helpers/slotHelpers'

const addRecipientAction = (
    state: CompositionModel,
    payload: SelectedRecipientAddressType
): CompositionModel => {
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
            const newSlot = currentSolver.addRecipient({
                type: payload.value,
                data: sourceEntity.address,
                solverConfigAdress: {
                    type: payload.value,
                    solverId: payload.solverId,
                },
            })

            // Link Entity to new slot
            if (
                !sourceEntity?.linkedSlots.find((x: string) => x === newSlot.id)
            ) {
                sourceEntity?.linkedSlots.push(newSlot.id)
            }
        } else if (isSlot(payload.value)) {
            // Did i receive a Slot or a Solver as recipient?

            // Slot received
            if (payload.solverId === currentSolver.id) {
                // A slot of the current solver has been selected as a recipient, just add it to our recipients
                currentSolver.addRecipient({
                    type: 'Slot_Exists',
                    data: payload.value.id,
                })
            } else {
                // The slot is from up the solver chain - We create a callback slot
                const newSlot = currentSolver.addRecipient({
                    type: 'Callback',
                    data: payload.value,
                    targetSolverId: payload.solverId,
                })

                addCallbackToTargetIncomingCallbacks(
                    newSlot,
                    currentSolver.id,
                    updatedSolvers
                )
            }
        } else {
            // Solver received - Create a function slot
            currentSolver.addRecipient({
                type: 'Solver',
                data: payload.value.id,
                targetSolverId: payload.value.id,
            })
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
