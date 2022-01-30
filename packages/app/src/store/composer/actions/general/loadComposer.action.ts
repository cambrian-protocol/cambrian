import { ComposerStateType } from '../../composer.types'
import Solver from '@cambrian/app/classes/Solver'

const loadComposerAction = (
    state: ComposerStateType,
    payload: ComposerStateType
) => {
    //TODO Dynamic ABI import of solver interface (Can't create Interface from JSON)
    const solversWithCorrectABI = payload.solvers.map((solver) => {
        return new Solver(solver.title, solver.iface, solver.id, solver.config)
    })

    return {
        ...payload,
        solvers: solversWithCorrectABI,
    }
}

export default loadComposerAction
