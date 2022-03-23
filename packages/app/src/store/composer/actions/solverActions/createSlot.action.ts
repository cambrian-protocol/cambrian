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

        let newSlot

        if (payload.slot.slotType === SlotType.Callback) {
            newSlot = currentSolver.addSlot({
                data: [''],
                slotType: payload.slot.slotType,
                dataTypes: payload.slot.dataTypes,
                reference: payload.slot.reference,
            })
        } else {
            newSlot = currentSolver.addSlot({
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
