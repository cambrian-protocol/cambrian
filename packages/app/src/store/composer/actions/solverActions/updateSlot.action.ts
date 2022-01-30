import { ComposerStateType, SlotActionPayload } from '../../composer.types'

const updateSlotAction = (
    state: ComposerStateType,
    payload: {
        slotIdToUpdate: string
        updatedSlot: SlotActionPayload
    }
) => {
    // TODO Edge case slot was an amount, but isn't anymore.

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

        currentSolver.updateSlot(
            payload.slotIdToUpdate,
            {
                data: payload.updatedSlot.data,
                slotType: payload.updatedSlot.slotType,
                dataTypes: payload.updatedSlot.dataTypes,
            },
            payload.updatedSlot.targetSolverId,
            payload.updatedSlot.solverFunction,
            payload.updatedSlot.description
        )

        return {
            ...state,
            solvers: updatedSolvers,
        }
    }
    console.error('No Solver selected')
    return state
}

export default updateSlotAction
