import { SolverCoreDataInputType } from '../ui/composer/controls/solver/general/ComposerSolverCoreDataInputControl'
import { ComposerConditionModel, ConditionModel } from './ConditionModel'
import { ComposerSlotModel, SlotModel } from './SlotModel'

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
    keeperAddress: {
        address: string
        linkedSlots: string[]
    }
    arbitratorAddress: {
        address: string
        linkedSlots: string[]
    }
    timelockSeconds?: number
    data?: SolverCoreDataInputType[]
    slots: {
        [key: string]: ComposerSlotModel
    }
    condition: ComposerConditionModel
}
