import {
    ComposerSolverConfigModel,
    SolverConfigModel,
} from './SolverConfigModel'
import {
    ConditionResponseType,
    SolverContractCondition,
} from './ConditionModel'
import { SlotResponseType, SlotsHistoryHashMapType } from './SlotModel'

import { OutcomeCollectionsHashMapType } from './OutcomeCollectionModel'
import { SlotTagsHashMapType } from './SlotTagModel'
import { SolverMetaDataModel } from './SolverMetaDataModel'
import { TimeLocksHashMapType } from './TimeLocksHashMapType'
import { TokenModel } from './TokenModel'
import { ethers } from 'ethers'

export type SolverModel = {
    config: SolverConfigModel
    conditions: SolverContractCondition[]
    slotsHistory: SlotsHistoryHashMapType
    outcomeCollections: OutcomeCollectionsHashMapType
    timelocksHistory: TimeLocksHashMapType
    numMintedTokensByCondition?: {
        [conditionId: string]: number
    }
    collateralToken: TokenModel
    collateralBalance: number
    metaData: SolverMetaDataModel
}

// Contract responses with BigNumbers
export type SolverResponseModel = {
    implementation: string
    keeper: string
    arbitrator: string
    timelockSeconds: number
    data: string
    ingests: SlotResponseType[]
    conditionBase: ConditionResponseType
}

/**
    Composer specific types
 **/

export type ComposerIdPathType = { solverId?: string; ocId?: string }

export type ComposerSolverModel = {
    id: string
    title: string
    iface: ethers.utils.Interface
    config: ComposerSolverConfigModel
    tags: SlotTagsHashMapType
}
