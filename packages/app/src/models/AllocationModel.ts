import { ComposerSlotModel, ComposerSlotPathType } from './SlotModel'

import { SlotWithMetaDataModel } from './SolverModel'

export type AllocationModel = {
    addressSlot: SlotWithMetaDataModel
    positionId: string
    amountPercentage: string
    amount?: string
}

export type AllocationPathsType = {
    recipientAddressSlot: string
    recipientAmountSlots: string[]
}

/* 
    Composer specific types
*/

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
