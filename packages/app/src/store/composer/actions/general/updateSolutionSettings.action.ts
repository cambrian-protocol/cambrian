import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { SolutionConfigFormType } from '@cambrian/app/ui/composer/config/SolutionConfig'

const updateSolutionSettingsAction = (
    state: CompositionModel,
    payload: SolutionConfigFormType
): CompositionModel => {
    const updatedSolvers = state.solvers.map((solver) => {
        solver.config.collateralToken = payload.collateralToken
        return solver
    })

    return {
        ...state,
        solvers: updatedSolvers,
    }
}

export default updateSolutionSettingsAction
