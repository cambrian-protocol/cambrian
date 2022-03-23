import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { SlotActionPayload } from '../../composer.types'
import { SlotTagFormInputType } from '@cambrian/app/ui/composer/controls/solver/general/forms/SlotTagForm'

const updateSlotAction = (
    state: CompositionModel,
    payload: {
        slotIdToUpdate: string
        updatedSlot: SlotActionPayload
        slotTag: SlotTagFormInputType
    }
) => {
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

        currentSolver.updateSlot({
            id: payload.slotIdToUpdate,
            data: payload.updatedSlot.data,
            slotType: payload.updatedSlot.slotType,
            dataTypes: payload.updatedSlot.dataTypes,
            targetSolverId: payload.updatedSlot.targetSolverId,
            solverFunction: payload.updatedSlot.solverFunction,
            reference: payload.updatedSlot.reference,
        })

        currentSolver.updateSlotTag({
            slotId: payload.slotIdToUpdate,
            label: payload.slotTag.label,
            description: payload.slotTag.description,
            isFlex: payload.slotTag.isFlex,
        })

        return {
            ...state,
            solvers: updatedSolvers,
        }
    }
    console.error('No Solver selected')
    return state
}

export default updateSlotAction
