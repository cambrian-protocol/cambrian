import { ComposerSlotModel, ComposerSlotPathType } from './SlotModel'

import { BigNumber } from 'ethers'
import { ComposerIdPathType } from './SolverModel'
import { OutcomeModel } from './OutcomeModel'
import { SolidityDataTypes } from './SolidityDataTypes'

export type OutcomeCollectionModel = {
    id: string
    outcomes: OutcomeModel[]
}

export type ComposerConditionModel = {
    collateralToken?: SolidityDataTypes.Address
    outcomes: OutcomeModel[]
    partition: OutcomeCollectionModel[]
    recipients: ComposerSlotPathType[]
    recipientAmountSlots: OCAllocations
    amountSlot: string
    parentCollection?: ComposerIdPathType
}

export type OCAllocations = {
    [outcomeCollectionId: string]: RecipientAmountPath[]
}

export type RecipientAmountPath = {
    recipient: ComposerSlotPathType
    amount: ComposerSlotPathType
}

export type RecipientAmountModel = {
    recipientModel: ComposerSlotModel
    amountModel: ComposerSlotModel
}

export type Multihash = {
    digest: string
    hashFunction: number
    size: number
}

export type ConditionModel = {
    collateralToken: string
    outcomeSlots: number
    parentCollectionIndexSet: number
    amountSlot: string
    partition: number[]
    allocations: ParsedAllocationModel[]
    outcomeURIs: Multihash[]
}

export type ParsedAllocationModel = {
    recipientAddressSlot: string
    recipientAmountSlots: string[]
}

/* 
    Contract responses with BigNumbers
*/
export type ConditionResponseType = {
    collateralToken: string
    outcomeSlots: number
    parentCollectionIndexSet: number
    amountSlot: string
    partition: BigNumber[]
    allocations: ParsedAllocationModel[]
    outcomeURIs: Multihash[]
}
