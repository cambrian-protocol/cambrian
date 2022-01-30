import { ConditionModel, ParsedConditionModel } from './ConditionModel'

import { SlotModel } from './SlotModel'
import { ethers } from 'ethers'

export type IdPathType = { solverId?: string; ocId?: string }

export type SolverConfigAddressType = {
    address: string
    linkedSlots: string[]
}

export type SolverConfig = {
    implementation?: string
    collateralToken?: string
    keeperAddress: SolverConfigAddressType
    arbitratorAddress: SolverConfigAddressType
    timelockSeconds?: number
    data?: string
    slots: {
        [key: string]: SlotModel
    }
    condition: ConditionModel
}

export type SolverModel = {
    id: string
    title: string
    iface: ethers.utils.Interface
    config: SolverConfig
}

export type ParsedSolverModel = {
    implementation: string
    keeper: string
    arbitrator: string
    timelockSeconds: number
    data: string
    conditionBase: ParsedConditionModel
}
