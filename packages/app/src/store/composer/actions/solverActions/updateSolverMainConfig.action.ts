import { ComposerStateType } from '../../composer.types'
import _ from 'lodash'

export type SolverMainConfigType = {
    title: string
    description: string
    keeperAddress: string
    arbitratorAddress: string
    timelockSeconds: number
}

const updateSolverMainConfigAction = (
    state: ComposerStateType,
    payload: SolverMainConfigType
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

        const keeperHasChanged =
            payload.keeperAddress !== currentSolver.config.keeperAddress.address

        const arbitratorHasChanged =
            payload.arbitratorAddress !==
            currentSolver.config.arbitratorAddress.address
        // Update all linkedSlots
        if (keeperHasChanged || arbitratorHasChanged) {
            updatedSolvers.forEach((solver) => {
                if (keeperHasChanged) {
                    currentSolver.config.keeperAddress.linkedSlots.forEach(
                        (linkedSlot: string) => {
                            const slot = solver.config.slots[linkedSlot]
                            if (slot !== undefined) {
                                slot.data = [payload.keeperAddress]
                            }
                        }
                    )
                }
                if (arbitratorHasChanged) {
                    currentSolver.config.arbitratorAddress.linkedSlots.forEach(
                        (linkedSlot: string) => {
                            const slot = solver.config.slots[linkedSlot]
                            if (slot !== undefined) {
                                slot.data = [payload.arbitratorAddress]
                            }
                        }
                    )
                }
            })
        }

        currentSolver.updateMainConfig(payload)

        const updatedFlow = state.flowElements.map((el) => {
            if (el.id === state.currentElement?.id) {
                el.data = {
                    ...el.data,
                    label: payload.title,
                }
            }
            return el
        })
        return {
            ...state,
            flowElements: updatedFlow,
            solvers: updatedSolvers,
        }
    }
    console.error('No Solver selected')
    return state
}

export default updateSolverMainConfigAction
