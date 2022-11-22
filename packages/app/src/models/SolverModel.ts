import {
    ConditionResponseType,
    SolverContractCondition,
} from './ConditionModel'
import { SlotResponseType, SlotsHistoryHashMapType } from './SlotModel'

import { BigNumber } from 'ethers'
import { ModuleLoaderModel } from './ModuleModel'
import { OutcomeCollectionsHashMapType } from './OutcomeCollectionModel'
import { SolverConfigModel } from './SolverConfigModel'
import { SolverTagModel } from './SolverTagModel'
import { TimeLocksHashMapType } from './TimeLocksHashMapType'
import { TokenModel } from './TokenModel'
import { SlotTagsHashMapType } from '../classes/Tags/SlotTag'

export type SolverModel = {
    config: SolverConfigModel
    conditions: SolverContractCondition[]
    slotsHistory: SlotsHistoryHashMapType
    outcomeCollections: OutcomeCollectionsHashMapType
    timelocksHistory: TimeLocksHashMapType
    numMintedTokensByCondition?: {
        [conditionId: string]: BigNumber
    }
    collateralToken: TokenModel
    collateralBalance: number
    slotTags?: SlotTagsHashMapType
    solverTag?: SolverTagModel
}

// Contract responses with BigNumbers
export type SolverResponseModel = {
    implementation: string
    keeper: string
    arbitrator: string
    timelockSeconds: number
    moduleLoaders: ModuleLoaderModel[]
    ingests: SlotResponseType[]
    conditionBase: ConditionResponseType
}

/**
    Composer specific types
 **/

export type ComposerIdPathType = { solverId?: string; ocId?: string }
