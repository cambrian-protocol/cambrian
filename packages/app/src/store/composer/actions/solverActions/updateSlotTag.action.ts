import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { SlotTagFormInputType } from '@cambrian/app/ui/composer/controls/solver/general/forms/SlotTagForm'

const updateSlotTagAction = (
    state: CompositionModel,
    payload: {
        slotIdToUpdate: string
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

export default updateSlotTagAction
