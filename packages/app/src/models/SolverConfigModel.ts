import { ComposerConditionModel, ConditionModel } from './ConditionModel'
import { ComposerSlotModel, SlotModel } from './SlotModel'
import { ModuleLoaderModel, ModuleModel } from './ModuleModel'

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
    modules: ModuleModel[]
    slots: {
        [key: string]: ComposerSlotModel
    }
    condition: ComposerConditionModel
}
