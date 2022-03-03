import {
    AllocationModel,
    ComposerAllocationsHashMapType,
} from './AllocationModel'
import { OutcomeCollectionModel, OutcomeModel } from './OutcomeModel'

import { BigNumber } from 'ethers'
import { ComposerIdPathType } from './SolverModel'
import { ComposerSlotPathType } from './SlotModel'
import { MultihashType } from './MultihashType'
import { SolidityDataTypes } from './SolidityDataTypes'

export type ConditionModel = {
    collateralToken: string
    outcomeSlots: number
    parentCollectionIndexSet: number
    amountSlot: string
    partition: number[]
    allocations: AllocationModel[]
    outcomeURIs: MultihashType[]
}

// Contract responses with BigNumbers
export type ConditionResponseType = {
    collateralToken: string
    outcomeSlots: number
    parentCollectionIndexSet: number
    amountSlot: string
    partition: BigNumber[]
    allocations: AllocationModel[]
    outcomeURIs: MultihashType[]
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
