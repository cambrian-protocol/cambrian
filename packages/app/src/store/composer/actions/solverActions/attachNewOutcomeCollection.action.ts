import { ComposerStateType } from '../../composer.types'
import { isNode } from 'react-flow-renderer'

const attachNewOutcomeCollectionAction = (
    state: ComposerStateType
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
            throw new Error('Error finding current Solver')
        }

        const newOc = currentSolver.addOutcomeCollection()

        // Flow updates
        const nextPosition = { x: 0, y: 0 }
        if (
            state.currentElement !== undefined &&
            isNode(state.currentElement)
        ) {
            nextPosition.x = state.currentElement.position.x + 200
            nextPosition.y = state.currentElement.position.y + 200
        }

        const newOcNodeId = `${state.currentIdPath.solverId}/${newOc.id}`
        const newOcNode = {
            id: newOcNodeId,
            type: 'oc',
            position: nextPosition,
            data: {
                label: `Outcome Collection`,
            },
        }
        const newSolverToOcEdge = {
            id: `e${state.currentIdPath.solverId}-${state.currentIdPath.solverId}/${newOc.id}`,
            source: `${state.currentIdPath.solverId}`,
            target: `${state.currentIdPath.solverId}/${newOc.id}`,
            type: 'step',
        }
        return {
            ...state,
            flowElements: state.flowElements.concat(
                newOcNode,
                newSolverToOcEdge
            ),
            solvers: updatedSolvers,
        }
    }
    console.error('No Solver selected')
    return state
}

export default attachNewOutcomeCollectionAction
