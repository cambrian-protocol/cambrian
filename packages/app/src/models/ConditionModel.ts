import { SlotModel, SlotPath } from './SlotModel'

import { IdPathType } from './SolverModel'
import { SolidityDataTypes } from './SolidityDataTypes'

export type OutcomeCollectionModel = {
    id: string
    outcomes: OutcomeModel[]
}

export type OutcomeModel = {
    id: string
    title: string
    uri: string
    description: string
    context?: string
}

export type ConditionModel = {
    collateralToken?: SolidityDataTypes.Address
    outcomes: OutcomeModel[]
    partition: OutcomeCollectionModel[]
    recipients: SlotPath[]
    recipientAmountSlots: OCAllocations
    amountSlot: string
    parentCollection?: IdPathType
}

export type OCAllocations = {
    [outcomeCollectionId: string]: RecipientAmountPath[]
}

export type RecipientAmountPath = { recipient: SlotPath; amount: SlotPath }

export type RecipientAmountModel = {
    recipientModel: SlotModel
    amountModel: SlotModel
}

export type Multihash = {
    digest: string
    hashFunction: number
    size: number
}

export type ParsedConditionModel = {
    collateralToken: string
    outcomeSlots: number
    parentCollectionIndexSet: number
    amountSlot: number
    partition: number[]
    allocations: ParsedAllocationModel[]
    outcomeURIs: Multihash[]
}

export type ParsedAllocationModel = {
    recipientAddressSlot: number
    recipientAmountSlots: number[]
}
