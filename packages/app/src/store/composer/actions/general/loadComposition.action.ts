import { BASE_SOLVER_IFACE } from 'packages/app/config/ContractInterfaces'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import Solver from '@cambrian/app/classes/ComposerSolver'
import { updateToSchema } from '@cambrian/app/utils/transformers/schema/ComposerSolver'
import { SCHEMA_VER } from 'packages/app/config'

const loadCompositionAction = (
    state: CompositionModel,
    payload: CompositionModel
) => {
    const composition = updateToSchema(SCHEMA_VER['composition'], payload)
    //TODO Dynamic ABI import of solver interface (Can't create functional Interface from JSON)
    const solversWithCorrectABI = composition.solvers.map((solver) => {
        return new Solver(
            BASE_SOLVER_IFACE,
            solver.id,
            solver.config,
            solver.slotTags,
            solver.solverTag
        )
    })

    return {
        ...composition,
        solvers: solversWithCorrectABI,
        schemaVer: SCHEMA_VER['composition'],
        // unset currentElement && currentIdPath
        currentElement: undefined,
        currentIdPath: undefined,
    }
}

export default loadCompositionAction
