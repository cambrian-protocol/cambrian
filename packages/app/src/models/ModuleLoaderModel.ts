import { RegisteredModule } from '../services/api/ModuleRegistry'
import { SolverModuleInputType } from '../ui/composer/controls/solver/general/ComposerSolverModuleInputControl'

export type ModuleLoaderModel = {
    module: string // address
    data: string
}

export type ComposerModuleLoaderModel = {
    module: RegisteredModule
    data: SolverModuleInputType[]
}
