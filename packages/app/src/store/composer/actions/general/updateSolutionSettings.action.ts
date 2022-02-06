import { ComposerStateType } from '../../composer.types'
import { SolutionConfigFormType } from '@cambrian/app/ui/composer/config/SolutionConfig'

const updateSolutionSettingsAction = (
    state: ComposerStateType,
    payload: SolutionConfigFormType
): ComposerStateType => {
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
