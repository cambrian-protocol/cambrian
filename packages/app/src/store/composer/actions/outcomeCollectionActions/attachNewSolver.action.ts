import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import Solver from '@cambrian/app/classes/ComposerSolver'
import { isNode } from 'react-flow-renderer'

const attachNewSolverAction = (state: CompositionModel): CompositionModel => {
    if (
        state.currentIdPath !== undefined &&
        state.currentIdPath.solverId !== undefined &&
        state.currentIdPath.ocId !== undefined &&
        !isNaN(state.currentIdPath.solverId.length) &&
        !isNaN(state.currentIdPath.ocId.length)
    ) {
        const updatedSolvers = [...state.solvers]

        const currentSolver = updatedSolvers.find(
            (x) => x.id === state.currentIdPath?.solverId
        )
        if (!currentSolver) {
            throw new Error('Error finding current Solver')
        }

        // Create new Solver
        const newSolver = new Solver()

        if (currentSolver.config.collateralToken) {
            newSolver.updateCollateralToken(
                currentSolver.config.collateralToken
            )
        }

        newSolver.setParentCollection({
            solverId: state.currentIdPath.solverId,
            ocId: state.currentIdPath.ocId,
        })

        currentSolver.addRecipient({
            type: 'Solver',
            data: newSolver.id,
            targetSolverId: newSolver.id,
        })

        // Flow updates
        const nextPosition = { x: 0, y: 0 }
        if (
            state.currentElement !== undefined &&
            isNode(state.currentElement)
        ) {
            nextPosition.x = state.currentElement.position.x
            nextPosition.y = state.currentElement.position.y + 150
        }
        const newSolverElement = {
            id: `${newSolver.id}`,
            type: 'solver',
            position: nextPosition,
            data: { label: `New Solver` },
        }

        const newEdge = {
            id: `e${currentSolver.id}/${state.currentIdPath.ocId}-${newSolver.id}`,
            source: `${currentSolver.id}/${state.currentIdPath.ocId}`,
            target: `${newSolver.id}`,
            type: 'step',
        }

        updatedSolvers.push(newSolver)

        return {
            ...state,
            flowElements: state.flowElements.concat(newSolverElement, newEdge),
            solvers: updatedSolvers,
        }
    }
    console.error('No Solver selected')
    return state
}

export default attachNewSolverAction
