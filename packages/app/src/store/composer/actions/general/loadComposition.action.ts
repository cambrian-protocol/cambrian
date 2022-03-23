import * as Constants from '@cambrian/app/constants'

import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import Solver from '@cambrian/app/classes/ComposerSolver'
import { ethers } from 'ethers'

const loadCompositionAction = (
    state: CompositionModel,
    payload: CompositionModel
) => {
    //TODO Dynamic ABI import of solver interface (Can't create functional Interface from JSON)
    const solversWithCorrectABI = payload.solvers.map((solver) => {
        return new Solver(
            new ethers.utils.Interface(Constants.DEFAULT_ABI),
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
