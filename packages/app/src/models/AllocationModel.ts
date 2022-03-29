import {
    ComposerSlotModel,
    ComposerSlotPathType,
    RichSlotModel,
} from './SlotModel'

import { BigNumber } from 'ethers'

export type RecipientAllocationModel = {
    addressSlot: RichSlotModel
    positionId?: string
    amountPercentage: string
    amount?: BigNumber
}

export type RecipientAllocationPathsType = {
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
