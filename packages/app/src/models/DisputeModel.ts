import { BigNumber } from 'ethers'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'

export type DisputeModel = {
    choices: number[][]
    conditionIndex: number
    disputers: SolidityDataTypes.Address[]
    fee: BigNumber
    lapse: BigNumber
    solver: SolidityDataTypes.Address
}
