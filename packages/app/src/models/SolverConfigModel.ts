import { ComposerConditionModel, ConditionModel } from './ConditionModel'
import { ComposerSlotModel, SlotModel } from './SlotModel'

import { SolverCoreDataInputType } from '../ui/composer/controls/solver/general/ComposerSolverCoreDataInputControl'

export type SolverConfigModel = {
    implementation: string
    keeper: string
    arbitrator: string
    timelockSeconds: number
    data: string
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
    data?: SolverCoreDataInputType[]
    slots: {
        [key: string]: ComposerSlotModel
    }
    condition: ComposerConditionModel
}
