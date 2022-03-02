import { ComposerSlotModel, SlotModel, SlotResponseType } from './SlotModel'
import {
    ConditionModel,
    ConditionResponseType,
    ParsedConditionModel,
} from './ConditionModel'
import { Tag, Tags } from './TagModel'

import { ConditionStatus } from './ConditionStatus'
import { OutcomeModel } from './OutcomeModel'
import { SolidityDataTypes } from './SolidityDataTypes'
import { TokenModel } from './TokenModel'
import { ethers } from 'ethers'

/**
 * Solution Composer
 **/

export type IdPathType = { solverId?: string; ocId?: string }

export type SolverConfigAddressType = {
    address: string
    linkedSlots: string[]
}

export type SolverConfig = {
    implementation?: string
    collateralToken?: string
    keeperAddress: SolverConfigAddressType
    arbitratorAddress: SolverConfigAddressType
    timelockSeconds?: number
    data?: string
    slots: {
        [key: string]: ComposerSlotModel
    }
    condition: ConditionModel
}

// TODO Individual Solver description
export type SolverModel = {
    id: string
    title: string
    iface: ethers.utils.Interface
    config: SolverConfig
    tags: Tags
}

/**
 * Solver Config
 **/

export type ParsedSolverModel = {
    implementation: string
    keeper: string
    arbitrator: string
    timelockSeconds: number
    data: string
    conditionBase: ParsedConditionModel
}

/**
 * Contract-interaction Solver Component
 **/

export type SolverContractConfigModel = {
    implementation: string
    keeper: string
    arbitrator: string
    timelockSeconds: number
    data: string
    ingests: SlotModel[]
    conditionBase: ParsedConditionModel
}

export type SolverContractData = {
    config: SolverContractConfigModel
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
    metaData: SolverModel[]
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
