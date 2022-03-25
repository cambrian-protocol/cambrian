import { getOutgoers, isNode, removeElements } from 'react-flow-renderer'

import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import _ from 'lodash'

const deleteNodeAction = (state: CompositionModel): CompositionModel => {
    if (
        state.currentIdPath !== undefined &&
        state.currentIdPath.solverId !== undefined &&
        state.currentElement !== undefined &&
        isNode(state.currentElement)
    ) {
        const updatedSolvers = [...state.solvers]
        const currentSolver = updatedSolvers.find(
            (x) => x.id === state.currentIdPath?.solverId
        )

        if (!currentSolver) {
            console.error('Error finding current Solver')
            return state
        }

        let updatedFlow = [...state.flowElements]
        if (
            state.currentIdPath.ocId !== undefined &&
            state.currentIdPath.ocId.length
        ) {
            // It is an outcome collection to be deleted
            currentSolver.deleteOutcomeCollection(state.currentIdPath.ocId)

            // Null any parentCollections referring to deleted outcome collection
            updatedSolvers.forEach((solver) => {
                if (
                    solver.config.condition.parentCollection?.solverId ===
                    currentSolver.id
                ) {
                    solver.setParentCollection(null)
                }
            })
            // Update flow
            updatedFlow = removeElements([state.currentElement], updatedFlow)
        } else {
            // It is a Solver to be deleted
            if (
                currentSolver.config.condition.parentCollection &&
                currentSolver.config.condition.parentCollection.solverId
            ) {
                // Remove parentCollections referring to deleted Solver
                updatedSolvers.forEach((solver) => {
                    if (
                        solver.config.condition.parentCollection?.solverId ===
                        currentSolver.id
                    ) {
                        solver.setParentCollection(null)
                    }
                })

                // Delete RecipientSlot of deleted Solver from parent
                const parentSolver = updatedSolvers.find(
                    (x) =>
                        x.id ===
                        currentSolver.config.condition.parentCollection
                            ?.solverId
                )
                if (parentSolver) {
                    const solverRecipientId = Object.keys(
                        parentSolver.config.slots
                    ).find((slotId) => {
                        const currentSlot = parentSolver.config.slots[slotId]
                        return currentSlot.data[0] === currentSolver.id
                    })
                    if (solverRecipientId) {
                        parentSolver.deleteRecipient(solverRecipientId)
                    }
                }

                // Delete the solver
                const solverIdx = state.solvers.findIndex(
                    (x) => x.id === state.currentIdPath?.solverId
                )
                if (solverIdx) {
                    updatedSolvers.splice(solverIdx, 1)
                }
                const elementsToRemove = getOutgoers(
                    state.currentElement,
                    state.flowElements
                )

                elementsToRemove.push(state.currentElement)
                updatedFlow = removeElements(
                    elementsToRemove,
                    state.flowElements
                )
            }
        }
        return {
            ...state,
            flowElements: updatedFlow,
            currentElement: undefined,
            solvers: updatedSolvers,
        }
    }
    console.error('No Node selected')
    return state
}

export default deleteNodeAction
