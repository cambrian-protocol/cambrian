import {
    ComposerSolverConfigModel,
    SolverConfigModel,
} from './SolverConfigModel'
import { SlotModel, SlotResponseType } from './SlotModel'
import { TagModel, Tags } from './TagModel'

import { ConditionResponseType } from './ConditionModel'
import { ConditionStatus } from './ConditionStatus'
import { OutcomeCollectionsHashMapType } from './OutcomeCollectionModel'
import { SolidityDataTypes } from './SolidityDataTypes'
import { TimeLocksHashMapType } from './TimeLocksHashMapType'
import { TokenModel } from './TokenModel'
import { ethers } from 'ethers'

/**
 * Contract-interaction Solver Component
 **/

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

export type SlotsHistoryHashMapType = {
    [conditionId: string]: SlotsHashMapType
}

export type SlotsHashMapType = { [slot: string]: SlotWithMetaDataModel }

export type SlotWithMetaDataModel = {
    slot: SlotModel
    description: string
    tag: TagModel
    dataType: SolidityDataTypes
}

export type SolverContractCondition = {
    executions: number
    collateralToken: string
    questionId: string
    parentCollectionId: string
    conditionId: string
    payouts: number[]
    status: ConditionStatus
}

/* 
    Contract Responses with BigNumbers
*/
export type SolverContractConfigResponseType = {
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
    tags: Tags
}
