import { BigNumber } from 'ethers'
import { TokenAPI } from '@cambrian/app/services/api/Token.api'
import { TokenModel } from '@cambrian/app/models/TokenModel'

export const formatDecimals = (
    token: TokenModel | undefined,
    amount: BigNumber | number | string
) => {
    let amnt = BigNumber.from(amount)

    if (token?.decimals) {
        return amnt.div(BigNumber.from(10).pow(token.decimals))
    } else {
        return amnt.div(BigNumber.from(10).pow(18).toString())
    }
}

/* 
    Adds the provided token decimals to the provided amount and returns it as BigNumber. If no token decimal is provided it add 18 decimals by default.
*/
export const addTokenDecimals = (
    amount: number | BigNumber,
    token?: TokenModel
) => {
    const bigNumberAmount: BigNumber = BigNumber.from(amount)

    if (token?.decimals) {
        return bigNumberAmount.mul(
            BigNumber.from(10).pow(BigNumber.from(token.decimals))
        )
    } else {
        return bigNumberAmount.mul(BigNumber.from(10).pow(BigNumber.from(18)))
    }
}

export const fetchTokenInfo = async (address?: string) => {
    if (address && address.length === 42) {
        const token = await TokenAPI.getTokenInfo(address)
        if (token) {
            return token
        }
    }
}
