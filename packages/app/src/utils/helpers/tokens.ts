import { Provider } from '@ethersproject/providers'
import { TokenAPI } from '@cambrian/app/services/api/Token.api'
import { ethers } from 'ethers'

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
