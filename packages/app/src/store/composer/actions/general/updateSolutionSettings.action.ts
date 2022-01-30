import { ComposerStateType } from '../../composer.types'
import { SolutionSettingsFormType } from '@cambrian/app/ui/composer/controls/solution/SolutionSettingsModal'

const updateSolutionSettingsAction = (
    state: ComposerStateType,
    payload: SolutionSettingsFormType
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
