import {
    AllocationPathsType,
    ComposerAllocationsHashMapType,
} from './AllocationModel'

import { BigNumber } from 'ethers'
import { ComposerIdPathType } from './SolverModel'
import { ComposerOutcomeCollectionModel } from './OutcomeCollectionModel'
import { ComposerSlotPathType } from './SlotModel'
import { ConditionStatus } from './ConditionStatus'
import { OutcomeModel } from './OutcomeModel'
import { SolidityDataTypes } from './SolidityDataTypes'

export type ConditionModel = {
    collateralToken: string
    outcomeSlots: number
    parentCollectionIndexSet: number
    amountSlot: string
    partition: number[]
    allocations: AllocationPathsType[]
    outcomeURIs: string[]
}

// TODO Type merge or renaming if really necessary. Will circle back to it as soon as composer => interaction flow is clear
export type SolverContractCondition = {
    executions: number
    collateralToken: string
    questionId: string
    parentCollectionId: string
    conditionId: string
    payouts: number[]
    status: ConditionStatus
}

// Contract responses with BigNumbers
export type ConditionResponseType = {
    collateralToken: string
    outcomeSlots: number
    parentCollectionIndexSet: number
    amountSlot: string
    partition: BigNumber[]
    allocations: AllocationPathsType[]
    outcomeURIs: string[]
}

/* 
    Composer specific types
*/

export type ComposerConditionModel = {
    collateralToken?: SolidityDataTypes.Address
    outcomes: OutcomeModel[]
    partition: ComposerOutcomeCollectionModel[]
    recipients: ComposerSlotPathType[]
    recipientAmountSlots: ComposerAllocationsHashMapType
    amountSlot: string
    parentCollection?: ComposerIdPathType
}
