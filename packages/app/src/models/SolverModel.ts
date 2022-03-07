import {
    ComposerSolverConfigModel,
    SolverConfigModel,
} from './SolverConfigModel'
import { SlotResponseType, SlotsHistoryHashMapType } from './SlotModel'

import { ConditionResponseType } from './ConditionModel'
import { ConditionStatus } from './ConditionStatus'
import { OutcomeCollectionsHashMapType } from './OutcomeCollectionModel'
import { Tags } from './TagModel'
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
    metaData: ComposerSolverModel[]
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

// TODO Extract into ConditionModel, refactor
export type SolverContractCondition = {
    executions: number
    collateralToken: string
    questionId: string
    parentCollectionId: string
    conditionId: string
    payouts: number[]
    status: ConditionStatus
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
    tags: Tags
}
