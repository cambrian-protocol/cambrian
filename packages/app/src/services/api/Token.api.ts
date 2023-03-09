import { TokenModel } from '@cambrian/app/models/TokenModel'
import { ethers } from 'ethers'
import { ERC20_IFACE } from 'packages/app/config/ContractInterfaces'
import { cpLogger } from './Logger.api'
import tokenList from '@cambrian/app/public/tokenlists/uniswap_tokenlist.json'

export const TokenAPI = {
    getTokenInfo: async (
        address: string,
        provider?: ethers.providers.Provider,
        chainId?: number
    ): Promise<TokenModel> => {
        const chainIdValue = chainId || 42161
        if (address && address.length === 42) {
            let erc20Contract
            try {
                erc20Contract = new ethers.Contract(
                    address,
                    ERC20_IFACE,
                    provider
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

                const tokenListTokenInfo: TokenModel | undefined =
                    tokenList.tokens.find(
                        (token) =>
                            token.chainId === chainId &&
                            token.address === address
                    )

                try {
                    const token = <TokenModel>{
                        chainId: chainId,
                        address: address,
                        decimals:
                            decimals.status === 'fulfilled'
                                ? decimals.value
                                : 18,
                        name:
                            name.status === 'fulfilled'
                                ? name.value
                                : undefined,
                        symbol:
                            symbol.status === 'fulfilled' ? symbol.value : '??',
                        totalSupply:
                            totalSupply.status === 'fulfilled'
                                ? totalSupply.value
                                : undefined,
                        logoURI: tokenListTokenInfo?.logoURI,
                    }

                    return token
                } catch (e) {
                    cpLogger.push(e)
                }
            }
        }

        return <TokenModel>{
            chainId: chainId,
            address: address,
            symbol: '??',
            decimals: 18,
        }
    },
}
