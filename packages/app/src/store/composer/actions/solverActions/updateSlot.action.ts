import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { CreateSlotActionPayload } from './createSlot.action'

const updateSlotAction = (
    state: CompositionModel,
    payload: {
        slotIdToUpdate: string
        updatedSlot: CreateSlotActionPayload
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
            label: payload.updatedSlot.label,
            description: payload.updatedSlot.description,
            isFlex: payload.updatedSlot.isFlex,
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
