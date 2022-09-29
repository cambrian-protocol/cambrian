import { Provider } from '@ethersproject/providers'
import { TokenAPI } from '@cambrian/app/services/api/Token.api'
import { BigNumber, ethers } from 'ethers'
import { TokenModel } from '@cambrian/app/models/TokenModel'

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
