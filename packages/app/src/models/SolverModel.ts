import { BigNumber, ethers } from 'ethers'
import {
    ComposerSolverConfigModel,
    SolverConfigModel,
} from './SolverConfigModel'
import {
    ConditionResponseType,
    SolverContractCondition,
} from './ConditionModel'
import { SlotResponseType, SlotsHistoryHashMapType } from './SlotModel'

import { ModuleLoaderModel } from './ModuleModel'
import { OutcomeCollectionsHashMapType } from './OutcomeCollectionModel'
import { SlotTagsHashMapType } from './SlotTagModel'
import { SolverTagModel } from './SolverTagModel'
import { TimeLocksHashMapType } from './TimeLocksHashMapType'
import { TokenModel } from './TokenModel'

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
