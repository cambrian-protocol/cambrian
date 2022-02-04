import { SolidityDataTypes } from './SolidityDataTypes'
import { BigNumber, ethers } from 'ethers'

export enum SlotTypes {
    Callback = 0,
    Constant = 1,
    Function = 2,
    Manual = 3,
}

export type SlotPath = { solverId: string; slotId: string }

export type SlotsObj = { [key: string]: SlotModel }

export type SolverConfigAddress = {
    type: 'Keeper' | 'Arbitrator'
    solverId: string
}

export type SlotModel = {
    id: string
    slotType: SlotTypes
    dataTypes: SolidityDataTypes[]
    data: any[] // TODO
    description?: string | null | undefined
    targetSolverId?: string | null | undefined
    solverFunction?: ethers.utils.FunctionFragment | null | undefined
    incomingCallbacks?: SlotPath[]
    solverConfigAddress?: SolverConfigAddress
}

export type ParsedSlotModel = {
    executions: number
    ingestType: SlotTypes
    slot: string
    solverIndex: number
    data: string
}

export type GetSlotModel = {
    slot: string
    executions: BigNumber
    ingestType: SlotTypes
    solverIndex: BigNumber
    data: string
}
