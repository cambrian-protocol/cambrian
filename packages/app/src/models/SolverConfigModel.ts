import { ComposerConditionModel, ConditionModel } from './ConditionModel'
import { ComposerModuleModel, ModuleLoaderModel } from './ModuleModel'
import { ComposerSlotModel, SlotModel } from './SlotModel'

export type SolverConfigModel = {
    implementation: string
    keeper: string
    arbitrator: string
    timelockSeconds: number
    moduleLoaders: ModuleLoaderModel[]
    ingests: SlotModel[]
    conditionBase: ConditionModel
}

/* 
    Composer specific types
*/

export type ComposerSolverConfigModel = {
    implementation?: string
    collateralToken?: string
    keeperAddress: string
    arbitratorAddress: string
    timelockSeconds?: number
    modules?: ComposerModuleModel[]
    slots: {
        [key: string]: ComposerSlotModel
    }
    condition: ComposerConditionModel
}
