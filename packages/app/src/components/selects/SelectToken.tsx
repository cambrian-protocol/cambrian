import { Box, Button, Text, TextInput } from 'grommet'
import { Check, MagnifyingGlass, Warning } from 'phosphor-react'
import {
    fetchTokenInfo,
    parseTokenContractInfo,
} from '@cambrian/app/utils/helpers/tokens'
import { useEffect, useState } from 'react'

import BasePopupModal from '../modals/BasePopupModal'
import BaseSkeletonBox from '../skeletons/BaseSkeletonBox'
import BaseTokenItem from '../token/BaseTokenItem'
import BaseTokenLogo from '../token/BaseTokenLogo'
import { TokenInfo } from '@uniswap/token-lists'
import tokenList from '@cambrian/app/public/tokenlists/uniswap_tokenlist.json'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'

interface SelectTokenProps {
    selectedTokenAddresses: string[]
    onSelect: (newSelectedTokenAddress: string) => void
    preferredTokenList?: string[]
    allowAnyPaymentToken: boolean
}

const SelectToken = ({
    selectedTokenAddresses,
    onSelect,
    allowAnyPaymentToken,
    preferredTokenList,
}: SelectTokenProps) => {
    const { currentUser } = useCurrentUserContext()
    const [searchQuery, setSearchQuery] = useState('')
    const [initialTokenList, setInitialTokenList] = useState<TokenInfo[]>([])
    const [filteredTokenList, setFilteredTokenList] = useState<TokenInfo[]>()

    const [showConfirmForeignTokenModal, setShowConfirmForeignTokenModal] =
        useState<TokenInfo>() // Selected foreign token

    useEffect(() => {
        initTokenList()
    }, [currentUser])

    useEffect(() => {
        filterTokenListByQuery(searchQuery)
    }, [searchQuery, initialTokenList])

    const initTokenList = async () => {
        if (currentUser) {
            if (allowAnyPaymentToken) {
                const existentSelectedTokenAddesses: string[] = []
                const _tokenList: TokenInfo[] = tokenList.tokens.filter(
                    (token) => {
                        if (token.chainId === currentUser.chainId) {
                            if (selectedTokenAddresses.includes(token.address))
                                existentSelectedTokenAddesses.push(
                                    token.address
                                )
                            return true
                        }
                    }
                )

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
                setInitialTokenList(_tokenList)
                setFilteredTokenList(_tokenList)
            } else if (preferredTokenList) {
                const _tokenList: TokenInfo[] = tokenList.tokens.filter(
                    (token) =>
                        token.chainId === currentUser.chainId &&
                        preferredTokenList.includes(token.address)
                )
                if (_tokenList.length < preferredTokenList.length) {
                    await Promise.all(
                        preferredTokenList.map(
                            async (preferredTokenAddress) => {
                                if (
                                    _tokenList.findIndex(
                                        (token) =>
                                            token.address ===
                                            preferredTokenAddress
                                    ) === -1
                                ) {
                                    _tokenList.unshift(
                                        parseTokenContractInfo(
                                            await fetchTokenInfo(
                                                preferredTokenAddress,
                                                currentUser.signer
                                            ),
                                            currentUser.chainId
                                        )
                                    )
                                }
                            }
                        )
                    )
                }
                setInitialTokenList(_tokenList)
                setFilteredTokenList(_tokenList)
            }
        }
    }
    const filterTokenListByQuery = async (query: string) => {
        if (query.length > 0) {
            if (query.length === 42) {
                const filteredListByAddress = [...initialTokenList].filter(
                    (token) =>
                        token.address
                            .toUpperCase()
                            .includes(query.toUpperCase())
                )
                if (filteredListByAddress.length === 1) {
                    setFilteredTokenList(filteredListByAddress)
                } else if (filteredListByAddress.length === 0 && currentUser) {
                    if (allowAnyPaymentToken) {
                        setFilteredTokenList([
                            parseTokenContractInfo(
                                await fetchTokenInfo(query, currentUser.signer),
                                currentUser.chainId
                            ),
                        ])
                    } else {
                        setFilteredTokenList([])
                    }
                }
            } else {
                const filteredListByName = [...initialTokenList].filter(
                    (token) =>
                        token.name
                            .toUpperCase()
                            .includes(query.toUpperCase()) ||
                        token.symbol.toUpperCase().includes(query.toUpperCase())
                )
                setFilteredTokenList(filteredListByName)
            }
        } else {
            setFilteredTokenList(initialTokenList)
        }
    }

    const handleSelect = (tokenInfo: TokenInfo) => {
        if (
            initialTokenList.findIndex(
                (token) => token.address === tokenInfo.address
            ) !== -1
        ) {
            onSelect(tokenInfo.address)
        } else {
            setShowConfirmForeignTokenModal(tokenInfo)
        }
    }

    return (
        <>
            {filteredTokenList ? (
                <Box>
                    <TextInput
                        icon={<MagnifyingGlass />}
                        placeholder="Search name or paste address"
                        value={searchQuery}
                        onChange={(e: any) => {
                            setSearchQuery(e.target.value)
                        }}
                    />
                    <Box
                        height={{ min: 'auto' }}
                        direction="row"
                        align="center"
                        wrap
                        pad={{ bottom: 'medium' }}
                    >
                        {allowAnyPaymentToken &&
                        preferredTokenList &&
                        preferredTokenList.length > 0
                            ? preferredTokenList.map((preferredToken) => (
                                  <BaseTokenItem
                                      key={preferredToken}
                                      tokenAddress={preferredToken}
                                      onClick={() => onSelect(preferredToken)}
                                  />
                              ))
                            : initialTokenList.map((token) => {
                                  if (token.tags?.includes('popular')) {
                                      return (
                                          <BaseTokenItem
                                              key={token.address}
                                              tokenAddress={token.address}
                                              onClick={() =>
                                                  onSelect(token.address)
                                              }
                                          />
                                      )
                                  }
                              })}
                    </Box>
                    <Box
                        overflow={{ vertical: 'auto' }}
                        pad={{ top: 'small' }}
                        gap="xsmall"
                        border={{ side: 'top' }}
                    >
                        {filteredTokenList.map((token) => {
                            const isAlreadyUsed =
                                selectedTokenAddresses.includes(token.address)
                            return (
                                <Box
                                    key={token.address}
                                    height={{ min: 'auto' }}
                                    direction="row"
                                    gap="small"
                                    align="center"
                                    onClick={
                                        !isAlreadyUsed
                                            ? () => handleSelect(token)
                                            : undefined
                                    }
                                    hoverIndicator
                                    focusIndicator={false}
                                    round="xsmall"
                                    pad={{
                                        horizontal: 'small',
                                        vertical: 'xsmall',
                                    }}
                                    background={
                                        isAlreadyUsed
                                            ? 'background-contrast'
                                            : undefined
                                    }
                                    justify="between"
                                >
                                    <Box
                                        direction="row"
                                        gap="small"
                                        align="center"
                                    >
                                        <BaseTokenLogo token={token} />
                                        <Box>
                                            <Text>{token.name}</Text>
                                            <Text size="small" color="dark-4">
                                                {token.symbol}
                                            </Text>
                                        </Box>
                                    </Box>
                                    {isAlreadyUsed && <Check />}
                                </Box>
                            )
                        })}
                    </Box>
                </Box>
            ) : (
                <Box gap="medium">
                    <BaseSkeletonBox height={'xsmall'} width={'100%'} />
                    <BaseSkeletonBox height={'medium'} width={'100%'} />
                </Box>
            )}
            {showConfirmForeignTokenModal && (
                <BasePopupModal
                    onClose={() => setShowConfirmForeignTokenModal(undefined)}
                >
                    <Box
                        gap="medium"
                        height={{ min: 'auto' }}
                        justify="between"
                        align="center"
                    >
                        <BaseTokenLogo
                            size="medium"
                            token={showConfirmForeignTokenModal}
                        />
                        <Box direction="row" gap="small" align="center">
                            <Warning size="18" />
                            <Text weight={'bold'} textAlign="center">
                                Caution
                            </Text>
                        </Box>
                        <Text size="small" textAlign="center">
                            This token isn't traded on leading U.S. centralized
                            exchanges. Always conduct your own research before
                            working with this token.
                        </Text>
                        <Box width={'100%'}>
                            <Button
                                primary
                                label="Confirm"
                                onClick={() =>
                                    onSelect(
                                        showConfirmForeignTokenModal.address
                                    )
                                }
                            />
                        </Box>
                    </Box>
                </BasePopupModal>
            )}
        </>
    )
}

export default SelectToken
