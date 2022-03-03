import { BigNumber, ethers } from 'ethers'

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

/* 
    Composer specific Types
*/

export type ComposerSlotModel = {
    id: string
    slotType: SlotType
    dataTypes: SolidityDataTypes[]
    data: any[] // TODO
    description?: string | null | undefined
    targetSolverId?: string | null | undefined
    solverFunction?: ethers.utils.FunctionFragment | null | undefined
    incomingCallbacks?: ComposerSlotPathType[]
    solverConfigAddress?: ComposerSolverConfigAddressType
}

export type ComposerSlotPathType = { solverId: string; slotId: string }

export type ComposerSlotsHashMapType = { [key: string]: ComposerSlotModel }

// To check if a certain slot is a Keeper or Arbitrator address of another solver
export type ComposerSolverConfigAddressType = {
    type: 'Keeper' | 'Arbitrator'
    solverId: string
}
