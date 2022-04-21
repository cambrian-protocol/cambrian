import { BigNumber, ethers } from 'ethers'

import { Provider } from '@ethersproject/providers'
import { TokenAPI } from '@cambrian/app/services/api/Token.api'
import { TokenModel } from '@cambrian/app/models/TokenModel'

// TODO Turn around params. Required should not follow an optional
export const formatDecimals = (
    token: TokenModel | undefined,
    amount: BigNumber | number | string
): BigNumber => {
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
): BigNumber => {
    try {
        const bigNumberAmount: BigNumber = BigNumber.from(amount)
        if (token?.decimals) {
            return bigNumberAmount.mul(
                BigNumber.from(10).pow(BigNumber.from(token.decimals))
            )
        } else {
            return bigNumberAmount.mul(
                BigNumber.from(10).pow(BigNumber.from(18))
            )
        }
    } catch (e) {
        return BigNumber.from(0)
    }
}

export const fetchTokenInfo = async (
    address: string,
    provider: ethers.providers.Provider
) => {
    if (address && address.length === 42) {
        const token = await TokenAPI.getTokenInfo(address, provider)
        if (token) {
            return token
        }
    }
}

export const getFormattedNumber = (
    amountWei: number | BigNumber,
    token?: TokenModel
): number => {
    const amountBigNumber = formatDecimals(token, amountWei)
    try {
        return amountBigNumber.toNumber()
    } catch (e) {
        console.warn(e)
        return 0
    }
}
