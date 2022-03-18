import { BigNumber } from 'ethers'

export type TokenModel = {
    address: string
    decimals: BigNumber
    name?: string
    symbol?: string
    totalSupply: BigNumber
}
