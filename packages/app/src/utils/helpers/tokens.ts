import { Provider } from '@ethersproject/providers'
import { TokenAPI } from '@cambrian/app/services/api/Token.api'
import { BigNumber, ethers } from 'ethers'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { TokenInfo } from '@uniswap/token-lists'

export const fetchTokenInfo = async (
    address: string,
    signerOrProvider: ethers.Signer | ethers.providers.Provider
) => {
    if (address && address.length === 42) {
        const token = await TokenAPI.getTokenInfo(address, signerOrProvider)
        if (token) {
            return token
        }
    }
    return <TokenModel>{
        address: address,
        decimals: BigNumber.from(18),
    }
}

export const parseTokenContractInfo = (
    token: TokenModel,
    chainId: number
): TokenInfo => {
    return {
        name: token.name || 'Unknown',
        symbol: token.symbol || '???',
        address: token.address,
        chainId: chainId,
        decimals: Number(token.decimals),
    }
}
