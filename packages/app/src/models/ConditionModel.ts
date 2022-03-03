import { ComposerSlotModel, ComposerSlotPathType } from './SlotModel'
import { OutcomeCollectionModel, OutcomeModel } from './OutcomeModel'

import { BigNumber } from 'ethers'
import { ComposerIdPathType } from './SolverModel'
import { SolidityDataTypes } from './SolidityDataTypes'

export type ConditionModel = {
    collateralToken: string
    outcomeSlots: number
    parentCollectionIndexSet: number
    amountSlot: string
    partition: number[]
    allocations: ParsedAllocationModel[]
    outcomeURIs: Multihash[]
}

// Contract responses with BigNumbers
export type ConditionResponseType = {
    collateralToken: string
    outcomeSlots: number
    parentCollectionIndexSet: number
    amountSlot: string
    partition: BigNumber[]
    allocations: ParsedAllocationModel[]
    outcomeURIs: Multihash[]
}

/* 
    Composer specific types
*/

export type ComposerConditionModel = {
    collateralToken?: SolidityDataTypes.Address
    outcomes: OutcomeModel[]
    partition: OutcomeCollectionModel[]
    recipients: ComposerSlotPathType[]
    recipientAmountSlots: ComposerAllocationsHashMapType
    amountSlot: string
    parentCollection?: ComposerIdPathType
}

export type ComposerAllocationsHashMapType = {
    [outcomeCollectionId: string]: ComposerAllocationPathsType[]
}

export type ComposerAllocationPathsType = {
    recipient: ComposerSlotPathType
    amount: ComposerSlotPathType
}

export type ComposerAllocationType = {
    recipientModel: ComposerSlotModel
    amountModel: ComposerSlotModel
}

export type Multihash = {
    digest: string
    hashFunction: number
    size: number
}

export type ParsedAllocationModel = {
    recipientAddressSlot: string
    recipientAmountSlots: string[]
}
