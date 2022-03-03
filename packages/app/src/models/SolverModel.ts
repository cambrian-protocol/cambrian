import {
    ComposerSolverConfigModel,
    SolverConfigModel,
} from './SolverConfigModel'
import { SlotModel, SlotResponseType } from './SlotModel'
import { Tag, Tags } from './TagModel'

import { ConditionResponseType } from './ConditionModel'
import { ConditionStatus } from './ConditionStatus'
import { OutcomeModel } from './OutcomeModel'
import { SolidityDataTypes } from './SolidityDataTypes'
import { TokenModel } from './TokenModel'
import { ethers } from 'ethers'

/**
 * Contract-interaction Solver Component
 **/

export type SolverModel = {
    config: SolverConfigModel
    conditions: SolverContractCondition[]
    outcomeCollections: SolverComponentOC[]
    allocationsHistory: SolverContractAllocationsHistoryType
    slotsHistory: SlotsHistoryHashMapType
    timelocksHistory: TimeLocksHashMap
    numMintedTokensByCondition?: {
        [conditionId: string]: number
    }
    collateralToken: TokenModel
    collateralBalance: number
    metaData: ComposerSolverModel[]
}

export type SolverComponentOC = {
    indexSet: number
    outcomes: OutcomeModel[]
}

export type TimeLocksHashMap = {
    [conditionId: string]: number
}

export type SlotsHistoryHashMapType = {
    [conditionId: string]: SlotsHashMapType
}

export type SlotsHashMapType = { [slot: string]: SlotWithMetaDataModel }

export type SolverContractAllocationsHistoryType = {
    [conditionId: string]: SolverContractAllocationsType
}

export type SolverContractAllocationsType = {
    address: SlotWithMetaDataModel
    allocations: AllocationType[]
}[]

export type SlotWithMetaDataModel = {
    slot: SlotModel
    description: string
    tag: Tag
    dataType: SolidityDataTypes
}

export type AllocationType = {
    amount: string
    outcomeCollectionIndexSet: number
    positionId: string
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
