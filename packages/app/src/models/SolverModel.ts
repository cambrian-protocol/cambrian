import {
    ComposerConditionModel,
    ConditionModel,
    ConditionResponseType,
} from './ConditionModel'
import { ComposerSlotModel, SlotModel, SlotResponseType } from './SlotModel'
import { Tag, Tags } from './TagModel'

import { ConditionStatus } from './ConditionStatus'
import { OutcomeModel } from './OutcomeModel'
import { SolidityDataTypes } from './SolidityDataTypes'
import { TokenModel } from './TokenModel'
import { ethers } from 'ethers'

/**
 * Solution Composer
 **/

export type ComposerIdPathType = { solverId?: string; ocId?: string }

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
    data?: string
    slots: {
        [key: string]: ComposerSlotModel
    }
    condition: ComposerConditionModel
}

export type ComposerSolverModel = {
    id: string
    title: string
    iface: ethers.utils.Interface
    config: ComposerSolverConfigModel
    tags: Tags
}

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

export type SolverConfigModel = {
    implementation: string
    keeper: string
    arbitrator: string
    timelockSeconds: number
    data: string
    ingests: SlotModel[]
    conditionBase: ConditionModel
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
