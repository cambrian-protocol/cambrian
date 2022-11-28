import { TokenAPI } from '@cambrian/app/services/api/Token.api'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { UserType } from '@cambrian/app/store/UserContext'
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
    const network = await provider.getNetwork()
    return <TokenModel>{
        chainId: network.chainId,
        symbol: '??',
        address: address,
        decimals: 18,
    }
}

export const getAllTokenInfoList = async (
    selectedTokenAddresses: string[],
    baseTokenInfoList: TokenModel[],
    currentUser: UserType
) => {
    const existentSelectedTokenAddesses: string[] = []
    const _tokenList: TokenModel[] = baseTokenInfoList.filter((token) => {
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
                        await fetchTokenInfo(
                            selectedTokenAddress,
                            currentUser.web3Provider
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
    baseTokenInfoList: TokenModel[],
    currentUser: UserType
) => {
    const _tokenList: TokenModel[] = baseTokenInfoList.filter(
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
                        await fetchTokenInfo(
                            tokenAddress,
                            currentUser.web3Provider
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
    baseTokenInfoList: TokenModel[]
) => {
    return [...baseTokenInfoList].filter(
        (token) =>
            token.name.toUpperCase().includes(query.toUpperCase()) ||
            token.symbol.toUpperCase().includes(query.toUpperCase())
    )
}

export const findTokenWithAddress = async (
    addressQuery: string,
    baseTokenInfoList: TokenModel[],
    fetchForeignToken: boolean,
    currentUser: UserType
) => {
    const filteredListByAddress = [...baseTokenInfoList].filter((token) =>
        token.address.toUpperCase().includes(addressQuery.toUpperCase())
    )

    if (filteredListByAddress.length === 1) {
        return filteredListByAddress
    } else if (filteredListByAddress.length === 0 && fetchForeignToken) {
        return [await fetchTokenInfo(addressQuery, currentUser.web3Provider)]
    }
    return []
}

export const isForeignToken = (
    token: TokenModel,
    tokenInfoList: TokenModel[]
) => tokenInfoList.findIndex((t) => t.address === token.address) === -1
