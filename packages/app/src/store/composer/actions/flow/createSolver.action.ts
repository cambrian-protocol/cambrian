import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import Solver from '@cambrian/app/classes/ComposerSolver'

const createSolverAction = (state: CompositionModel): CompositionModel => {
    const newSolver = new Solver()
    const updatedSolvers = [...state.solvers]
    updatedSolvers.push(newSolver)

    const newSolverElement = {
        id: `${newSolver.id}`,
        type: 'solver',
        position: { x: 0, y: 0 },
        data: { label: `Solver` },
    }

    return {
        ...state,
        flowElements: state.flowElements.concat(newSolverElement),
        solvers: updatedSolvers,
    }
}

export default createSolverAction
