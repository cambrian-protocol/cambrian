import { ComposerStateType } from '../store/composer/composer.types'
import { SolverModel } from './SolverModel'

export type CompositionModel = {
    solvers?: SolverModel[]
    composer: ComposerStateType
}
