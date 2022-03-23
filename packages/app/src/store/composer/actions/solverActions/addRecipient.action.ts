import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { SelectedRecipientAddressType } from '@cambrian/app/components/selects/SelectRecipient'

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

        currentSolver.addRecipientReference({
            solverId: payload.solverId,
            slotId: payload.value,
        })

        return {
            ...state,
            solvers: updatedSolvers,
        }
    }
    console.error('No Solver selected')
    return state
}

export default addRecipientAction
