import { TokenModel } from '@cambrian/app/models/TokenModel'
import { BigNumber } from 'ethers'

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
