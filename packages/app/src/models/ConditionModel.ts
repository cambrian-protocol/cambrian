import {
    AllocationModel,
    ComposerAllocationsHashMapType,
} from './AllocationModel'
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
    allocations: AllocationModel[]
    outcomeURIs: Multihash[]
}

// Contract responses with BigNumbers
export type ConditionResponseType = {
    collateralToken: string
    outcomeSlots: number
    parentCollectionIndexSet: number
    amountSlot: string
    partition: BigNumber[]
    allocations: AllocationModel[]
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

export type Multihash = {
    digest: string
    hashFunction: number
    size: number
}
