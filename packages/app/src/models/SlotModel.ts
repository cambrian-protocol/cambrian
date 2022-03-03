import { BigNumber, ethers } from 'ethers'

import { SolidityDataTypes } from './SolidityDataTypes'

export enum SlotTypes {
    Callback = 0,
    Constant = 1,
    Function = 2,
    Manual = 3,
}

export type SlotModel = {
    executions: number
    ingestType: SlotTypes
    slot: string
    solverIndex: number
    data: string
}

export type SlotResponseType = {
    slot: string
    executions: BigNumber
    ingestType: SlotTypes
    solverIndex: BigNumber
    data: string
}

export type ComposerSlotModel = {
    id: string
    slotType: SlotTypes
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
