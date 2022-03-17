import { BigNumber } from 'ethers'
import { TokenModel } from '@cambrian/app/models/TokenModel'

export const formatDecimals = (
    token: TokenModel | undefined,
    amount: BigNumber | number | string
) => {
    let amnt: any = amount

    if (typeof amount === 'string') {
        amnt = BigNumber.from(amount)
    }

    if (token?.decimals) {
        return amnt / Math.pow(10, token.decimals)
    } else {
        return amnt
    }
}

/* 
    Adds the provided token decimals to the provided amount and returns it as BigNumber. If no token decimal is provided it add 18 decimals by default.
*/
export const addTokenDecimals = (amount: number, token?: TokenModel) => {
    const bigNumberAmount: BigNumber = BigNumber.from(amount)

    if (token?.decimals) {
        return bigNumberAmount.mul(
            BigNumber.from(10).pow(BigNumber.from(token.decimals))
        )
    } else {
        return bigNumberAmount.mul(BigNumber.from(10).pow(BigNumber.from(18)))
    }
}
