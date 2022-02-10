import { ConditionModel, ParsedConditionModel } from './ConditionModel'

import { ParsedSlotModel, SlotModel } from './SlotModel'
import { ethers } from 'ethers'
import { Tag, Tags } from './TagModels'

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
        [key: string]: SlotModel
    }
    condition: ConditionModel
}

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

export type SolverComponentConfig = {
    implementation: string
    keeper: string
    arbitrator: string
    timelockSeconds: number
    data: string
    ingests: ParsedSlotModel[]
    conditionBase: ParsedConditionModel
}

export type SolverComponentOC = {
    indexSet: number
    outcomes: JSON[]
}

export enum ConditionStatus {
    Initiated,
    Executed,
    OutcomeProposed,
    ArbitrationRequested,
    ArbitrationPending,
    ArbitrationDelivered,
    OutcomeReported,
}

export type SolverComponentCondition = {
    collateralToken: string
    questionId: string
    parentCollectionId: string
    conditionId: string
    payouts: number[]
    status: ConditionStatus
}

export type SolverComponentData = {
    config: SolverComponentConfig
    outcomeCollections: SolverComponentOC[]
    allocations: { address: string; allocations: SolverComponentOC }
    conditions: SolverComponentCondition[]
    timelocks: number[]
    slots: { [slot: number]: ParsedSlotModel }
}
