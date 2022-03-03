import { ComposerSlotModel, ComposerSlotPathType } from './SlotModel'

export type AllocationModel = {
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
