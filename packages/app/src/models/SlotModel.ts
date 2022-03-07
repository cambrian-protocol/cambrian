import { BigNumber, ethers } from 'ethers'

import { SlotTagModel } from './SlotTagModel'
import { SlotType } from './SlotType'
import { SolidityDataTypes } from './SolidityDataTypes'

export type SlotModel = {
    executions: number
    ingestType: SlotType
    slot: string
    solverIndex: number
    data: string
}

export type SlotResponseType = {
    slot: string
    executions: BigNumber
    ingestType: SlotType
    solverIndex: BigNumber
    data: string
}

export type RichSlotsHashMapType = { [slot: string]: RichSlotModel }

export type RichSlotModel = {
    slot: SlotModel
    tag: SlotTagModel
}

export type SlotsHistoryHashMapType = {
    [conditionId: string]: RichSlotsHashMapType
}

/* 
    Composer specific Types
*/

export type ComposerSlotModel = {
    id: string
    slotType: SlotType
    dataTypes: SolidityDataTypes[]
    data: any[] // TODO
    targetSolverId?: string
    solverFunction?: ethers.utils.FunctionFragment
    incomingCallbacks?: ComposerSlotPathType[]
    solverConfigAddress?: ComposerSolverConfigAddressType
    tag: SlotTagModel
}

export type ComposerSlotPathType = { solverId: string; slotId: string }

export type ComposerSlotsHashMapType = { [key: string]: ComposerSlotModel }

// To check if a certain slot is a Keeper or Arbitrator address of another solver
export type ComposerSolverConfigAddressType = {
    type: 'Keeper' | 'Arbitrator'
    solverId: string
}
