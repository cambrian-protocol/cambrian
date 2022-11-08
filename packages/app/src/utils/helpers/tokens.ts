import { Provider } from '@ethersproject/providers'
import { TokenAPI } from '@cambrian/app/services/api/Token.api'
import { BigNumber, ethers } from 'ethers'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { TokenInfo } from '@uniswap/token-lists'
import { UserType } from '@cambrian/app/store/UserContext'

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

export const getAllTokenInfoList = async (
    selectedTokenAddresses: string[],
    baseTokenInfoList: TokenInfo[],
    currentUser: UserType
) => {
    const existentSelectedTokenAddesses: string[] = []
    const _tokenList: TokenInfo[] = baseTokenInfoList.filter((token) => {
        if (token.chainId === currentUser.chainId) {
            if (selectedTokenAddresses.includes(token.address))
                existentSelectedTokenAddesses.push(token.address)
            return true
        }
    })

    if (selectedTokenAddresses.length > 0) {
        await Promise.all(
            selectedTokenAddresses.map(async (selectedTokenAddress) => {
                if (
                    !existentSelectedTokenAddesses.includes(
                        selectedTokenAddress
                    )
                ) {
                    _tokenList.unshift(
                        parseTokenContractInfo(
                            await fetchTokenInfo(
                                selectedTokenAddress,
                                currentUser.signer
                            ),
                            currentUser.chainId
                        )
                    )
                }
            })
        )
    }
    return _tokenList
}

export const getTokenInfoListFromAddresses = async (
    tokenAddresses: string[],
    baseTokenInfoList: TokenInfo[],
    currentUser: UserType
) => {
    const _tokenList: TokenInfo[] = baseTokenInfoList.filter(
        (token) =>
            token.chainId === currentUser.chainId &&
            tokenAddresses.includes(token.address)
    )
    if (_tokenList.length < tokenAddresses.length) {
        await Promise.all(
            tokenAddresses.map(async (tokenAddress) => {
                if (
                    _tokenList.findIndex(
                        (token) => token.address === tokenAddress
                    ) === -1
                ) {
                    _tokenList.unshift(
                        parseTokenContractInfo(
                            await fetchTokenInfo(
                                tokenAddress,
                                currentUser.signer
                            ),
                            currentUser.chainId
                        )
                    )
                }
            })
        )
    }
    return _tokenList
}

export const findTokensWithName = (
    query: string,
    baseTokenInfoList: TokenInfo[]
) => {
    return [...baseTokenInfoList].filter(
        (token) =>
            token.name.toUpperCase().includes(query.toUpperCase()) ||
            token.symbol.toUpperCase().includes(query.toUpperCase())
    )
}

export const findTokenWithAddress = async (
    addressQuery: string,
    baseTokenInfoList: TokenInfo[],
    fetchForeignToken: boolean,
    currentUser: UserType
) => {
    const filteredListByAddress = [...baseTokenInfoList].filter((token) =>
        token.address.toUpperCase().includes(addressQuery.toUpperCase())
    )

    if (filteredListByAddress.length === 1) {
        return filteredListByAddress
    } else if (filteredListByAddress.length === 0 && fetchForeignToken) {
        return [
            parseTokenContractInfo(
                await fetchTokenInfo(addressQuery, currentUser.signer),
                currentUser.chainId
            ),
        ]
    }
    return []
}

export const isForeignToken = (token: TokenInfo, tokenInfoList: TokenInfo[]) =>
    tokenInfoList.findIndex((t) => t.address === token.address) === -1
