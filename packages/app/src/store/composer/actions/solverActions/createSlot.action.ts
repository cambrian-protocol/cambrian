import { ComposerStateType, SlotActionPayload } from '../../composer.types'
import { SlotModel, SlotTypes } from '@cambrian/app/models/SlotModel'

import { SolverModel } from '@cambrian/app/models/SolverModel'

const createSlotAction = (
    state: ComposerStateType,
    payload: SlotActionPayload
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

        const newSlot = currentSolver.addSlot(
            {
                data: payload.data,
                slotType: payload.slotType,
                dataTypes: payload.dataTypes,
            },
            payload.targetSolverId,
            payload.solverFunction,
            payload.description
        )

        if (payload.slotType === SlotTypes.Callback) {
            addCallbackToTargetIncomingCallbacks(
                newSlot,
                currentSolver.id,
                updatedSolvers
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

export default createSlotAction

/***
 * Function to add a callback slot to the incomingCallback Array
 *
 */
export const addCallbackToTargetIncomingCallbacks = (
    slot: SlotModel,
    currentSolverId: string,
    solvers: SolverModel[]
) => {
    if (
        slot.targetSolverId !== undefined &&
        slot.data.length === 1 &&
        !isNaN(slot.data[0])
    ) {
        const targetSlot = solvers.find(
            (solver) => solver.config.slots[slot.data[0]]
        )?.config.slots[slot.data[0]]

        if (targetSlot !== undefined) {
            const cbSlotPath = {
                solverId: currentSolverId,
                slotId: slot.id,
            }
            if (targetSlot.incomingCallbacks !== undefined) {
                targetSlot.incomingCallbacks.push(cbSlotPath)
            } else {
                targetSlot.incomingCallbacks = [cbSlotPath]
            }
        }
    }
}
