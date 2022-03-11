import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import Solver from '@cambrian/app/classes/ComposerSolver'

const loadCompositionAction = (
    state: CompositionModel,
    payload: CompositionModel
) => {
    //TODO Dynamic ABI import of solver interface (Can't create Interface from JSON)
    const solversWithCorrectABI = payload.solvers.map((solver) => {
        return new Solver(
            solver.iface,
            solver.id,
            solver.config,
            solver.slotTags,
            solver.solverTag
        )
    })

    return {
        ...payload,
        solvers: solversWithCorrectABI,
    }
}

export default loadCompositionAction
