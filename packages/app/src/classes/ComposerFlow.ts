import { Elements, getOutgoers, isNode } from 'react-flow-renderer'

import { ComposerSolverModel } from '../models/SolverModel'
import { OutcomeModel } from '@cambrian/app/models/OutcomeModel'
import { RecipientAllocationModel } from '../models/AllocationModel'
import { getRecipientAllocations } from '@cambrian/app/utils/helpers/slotHelpers'

interface ComposerFlowProps {
    solvers?: ComposerSolverModel[]
}

export type OutcomeCollectionNodeDataType = {
    outcomes: OutcomeModel[]
    recipientAllocations: RecipientAllocationModel[]
}

export type SolverNodeDataType = {
    currentSolver: ComposerSolverModel
    solvers: ComposerSolverModel[]
}

// TODO Layouting library integration
// TODO Integrating ComposerFlow Class into Composer
export default class ComposerFlow {
    flow: Elements<any>

    constructor({ solvers }: ComposerFlowProps) {
        this.flow = []
        solvers && this.parseIntoFlow(solvers)
    }

    parseIntoFlow(solvers: ComposerSolverModel[]) {
        solvers.forEach((currentSolver) => {
            this.addSolver(currentSolver.id, {
                currentSolver: currentSolver,
                solvers: solvers,
            })

            currentSolver.config.condition.partition.forEach((partition) => {
                const recipientAllocations = getRecipientAllocations(
                    currentSolver.config.condition.recipientAmountSlots[
                        partition.id
                    ],
                    currentSolver,
                    solvers
                )

                const outcomeCollectionData: OutcomeCollectionNodeDataType = {
                    outcomes: partition.outcomes,
                    recipientAllocations: recipientAllocations,
                }

                this.attachOutcomeCollection(
                    currentSolver.id,
                    partition.id,
                    outcomeCollectionData
                )
            })
        })
    }

    addSolver(solverId: string, data: SolverNodeDataType) {
        const newSolverElement = {
            id: `${solverId}`,
            type: 'solver',
            position: { x: 0, y: 0 },
            data: data,
        }
        this.flow.push(newSolverElement)
    }

    // TODO
    attachSolver(
        currentSolverId: string,
        outcomeCollectionId: string,
        newSolverId: string
    ) {
        // Flow updates
        const nextPosition = { x: 0, y: 0 }
        /* if (
            state.currentElement !== undefined &&
            isNode(state.currentElement)
        ) {
            nextPosition.x = state.currentElement.position.x
            nextPosition.y = state.currentElement.position.y + 150
        } */

        const newSolverElement = {
            id: newSolverId,
            type: 'solver',
            position: nextPosition,
            data: { label: newSolverId },
        }

        const newEdge = {
            id: `e${currentSolverId}/${outcomeCollectionId}-${newSolverId}`,
            source: `${currentSolverId}/${outcomeCollectionId}`,
            target: `${newSolverId}`,
            type: 'step',
        }

        this.flow.push(newEdge, newSolverElement)
    }

    // TODO
    removeSolver() {}

    attachOutcomeCollection(
        solverId: string,
        outcomeCollectionId: string,
        data: OutcomeCollectionNodeDataType
    ) {
        const newNodePosition = { x: 0, y: 0 }
        const solverNode = this.flow.find((x) => x.id === solverId)
        if (solverNode && isNode(solverNode)) {
            newNodePosition.y = solverNode.position.y + 300
            const outgoers = getOutgoers(solverNode, this.flow)
            outgoers.forEach((oc) => {
                newNodePosition.x += 400
            })
        }

        const outcomeCollectionNodeId = `${solverId}/${outcomeCollectionId}`
        const newOutcomeCollectionNode = {
            id: outcomeCollectionNodeId,
            type: 'outcomeCollection',
            position: newNodePosition,
            data: data,
        }
        const newSolverToOcEdge = {
            id: `e${solverId}-${outcomeCollectionNodeId}`,
            source: `${solverId}`,
            target: outcomeCollectionNodeId,
            type: 'step',
        }
        this.flow.push(newOutcomeCollectionNode, newSolverToOcEdge)
    }

    removeOutcomeCollection() {}
}
