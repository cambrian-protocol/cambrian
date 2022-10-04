import { TokenModel } from '@cambrian/app/models/TokenModel'
import { BigNumber, ethers } from 'ethers'
import { ERC20_IFACE } from 'packages/app/config/ContractInterfaces'
import { cpLogger } from './Logger.api'

export type TokenResponseType = {
    address: string
    decimals: BigNumber
    name?: string
    symbol?: string
    totalSupply: BigNumber
}

export const TokenAPI = {
    getTokenInfo: async (
        address: string,
        signerOrProvider: ethers.Signer | ethers.providers.Provider
    ): Promise<TokenResponseType> => {
        let erc20Contract
        try {
            erc20Contract = new ethers.Contract(
                address,
                ERC20_IFACE,
                signerOrProvider
            )
        } catch (e) {
            cpLogger.push(e)
        }
        if (erc20Contract) {
            const [name, decimals, symbol, totalSupply] =
                await Promise.allSettled([
                    erc20Contract.name(),
                    erc20Contract.decimals(),
                    erc20Contract.symbol(),
                    erc20Contract.totalSupply(),
                ])

            try {
                const token = <TokenModel>{
                    address: address,
                    decimals:
                        decimals.status === 'fulfilled'
                            ? decimals.value
                            : BigNumber.from(18),
                    name: name.status === 'fulfilled' ? name.value : undefined,
                    symbol: symbol.status === 'fulfilled' ? symbol.value : '??',
                    totalSupply:
                        totalSupply.status === 'fulfilled'
                            ? totalSupply.value
                            : undefined,
                }

                return token
            } catch (e) {
                cpLogger.push(e)
            }
        }

        return <TokenModel>{
            address: address,
            decimals: BigNumber.from(18),
        }
    },
}
