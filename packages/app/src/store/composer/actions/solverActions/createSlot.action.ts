import { ComposerSlotModel } from '@cambrian/app/models/SlotModel'
import { ComposerSolverModel } from '@cambrian/app/models/SolverModel'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { SlotActionPayload } from '../../composer.types'
import { SlotTagFormInputType } from '@cambrian/app/ui/composer/controls/solver/general/forms/SlotTagForm'
import { SlotType } from '@cambrian/app/models/SlotType'

const createSlotAction = (
    state: CompositionModel,
    payload: { slot: SlotActionPayload; slotTag: SlotTagFormInputType }
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
            throw new Error('currentSolver is undefined')
        }

        const newSlot = currentSolver.addSlot({
            data: payload.slot.data,
            slotType: payload.slot.slotType,
            dataTypes: payload.slot.dataTypes,
            targetSolverId: payload.slot.targetSolverId,
            solverFunction: payload.slot.solverFunction,
        })

        currentSolver.addSlotTag({
            slotId: newSlot.id,
            label: payload.slotTag.label,
            description: payload.slotTag.description,
            isFlex: payload.slotTag.isFlex,
        })

        if (payload.slot.slotType === SlotType.Callback) {
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
    slot: ComposerSlotModel,
    currentSolverId: string,
    solvers: ComposerSolverModel[]
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
