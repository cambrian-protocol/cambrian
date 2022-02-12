import { TokenModel } from '@cambrian/app/models/TokenModel'
import { ethers } from 'ethers'

const ERC20_ABI =
    require('@cambrian/core/artifacts/contracts/ToyToken.sol/ToyToken.json').abi

export type TokenResponseType = {
    address: string
    decimals?: number
    name?: string
    symbol?: string
    totalSupply: number
}

export const TokenAPI = {
    getTokenInfo: async (
        address: string
    ): Promise<TokenResponseType | undefined> => {
        let erc20Contract
        try {
            erc20Contract = new ethers.Contract(
                address,
                new ethers.utils.Interface(ERC20_ABI),
                ethers.getDefaultProvider()
            )
        } catch (e) {
            return
        }

        if (erc20Contract) {
            const [decimals, name, symbol, totalSupply] =
                await Promise.allSettled([
                    erc20Contract.name(),
                    erc20Contract.decimals(),
                    erc20Contract.symbol(),
                    erc20Contract.totalSupply(),
                ])

            try {
                const token = <TokenModel>{
                    address: address,
                    decimals: decimals.status === 'fulfilled' && decimals.value,
                    name: name.status === 'fulfilled' && name.value,
                    symbol: symbol.status === 'fulfilled' && symbol.value,
                    totalSupply:
                        totalSupply.status === 'fulfilled' && totalSupply.value,
                }

                return token
            } catch (e) {
                console.log(e)
                return
            }
        }
    },
}
