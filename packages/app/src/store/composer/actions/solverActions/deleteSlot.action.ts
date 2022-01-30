import { ComposerStateType } from '../../composer.types'
import { SlotModel } from '@cambrian/app/models/SlotModel'
import _ from 'lodash'

const deleteSlotAction = (
    state: ComposerStateType,
    payload: { slotToDelete: SlotModel }
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

        // Clean linkedSlots of SolverConfigAddresses
        if (payload.slotToDelete.solverConfigAddress !== undefined) {
            const solverConfigAddress = payload.slotToDelete.solverConfigAddress
            const propKey =
                solverConfigAddress.type === 'Keeper'
                    ? 'keeperAddress'
                    : 'arbitratorAddress'

            const sourceEntity = state.solvers.find(
                (x) => x.id === solverConfigAddress.solverId
            )?.config[propKey]

            if (sourceEntity) {
                sourceEntity.linkedSlots = sourceEntity.linkedSlots.filter(
                    (linkedSlot) => linkedSlot !== payload.slotToDelete.id
                )
            } else {
                throw new Error(
                    'Could not find solver with defined Keeper or Arbitrator'
                )
            }
        }

        currentSolver.deleteSlot(payload.slotToDelete.id)

        return {
            ...state,
            solvers: updatedSolvers,
        }
    }
    console.error('No Solver selected')
    return state
}

export default deleteSlotAction
