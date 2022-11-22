import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { SlotTagModel } from '@cambrian/app/src/classes/Tags/SlotTag'

const updateSlotTagAction = (
    state: CompositionModel,
    payload: {
        slotIdToUpdate: string
        slotTag: SlotTagModel
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

        currentSolver.updateSlotTag({
            slotId: payload.slotIdToUpdate,
            label: payload.slotTag.label,
            description: payload.slotTag.description,
            instruction: payload.slotTag.instruction,
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

export default updateSlotTagAction
