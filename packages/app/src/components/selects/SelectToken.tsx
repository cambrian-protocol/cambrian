import { Box, Button, Text, TextInput } from 'grommet'
import { Check, MagnifyingGlass, Warning } from 'phosphor-react'
import {
    findTokenWithAddress,
    findTokensWithName,
    getAllTokenInfoList,
    getTokenInfoListFromAddresses,
    isForeignToken,
} from '@cambrian/app/utils/helpers/tokens'
import { useEffect, useState } from 'react'

import BasePopupModal from '../modals/BasePopupModal'
import BaseTokenItem from '../token/BaseTokenItem'
import BaseTokenLogo from '../token/BaseTokenLogo'
import { TokenInfo } from '@uniswap/token-lists'
import { UserType } from '@cambrian/app/store/UserContext'
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
    const [filteredTokenList, setFilteredTokenList] = useState<TokenInfo[]>([])
    const [showConfirmForeignTokenModal, setShowConfirmForeignTokenModal] =
        useState<TokenInfo>() // Selected foreign token

    useEffect(() => {
        if (currentUser) initTokenList(currentUser)
    }, [currentUser])

    const initTokenList = async (user: UserType) => {
        const _tokenList: TokenInfo[] = allowAnyPaymentToken
            ? await getAllTokenInfoList(
                  selectedTokenAddresses,
                  tokenList.tokens,
                  user
              )
            : preferredTokenList
            ? await getTokenInfoListFromAddresses(
                  preferredTokenList,
                  tokenList.tokens,
                  user
              )
            : []

        setInitialTokenList(_tokenList)
        setFilteredTokenList(_tokenList)
    }
    const onChangeSearchQuery = async (query: string) => {
        if (query.length > 0 && currentUser) {
            const _tokenList: TokenInfo[] =
                query.length === 42
                    ? await findTokenWithAddress(
                          query,
                          initialTokenList,
                          allowAnyPaymentToken,
                          currentUser
                      )
                    : findTokensWithName(query, initialTokenList)

            setFilteredTokenList(_tokenList)
        } else {
            setFilteredTokenList(initialTokenList)
        }
    }

    const handleSelect = (tokenInfo: TokenInfo) => {
        if (isForeignToken(tokenInfo, initialTokenList)) {
            setShowConfirmForeignTokenModal(tokenInfo)
        } else {
            onSelect(tokenInfo.address)
        }
    }

    return (
        <>
            <Box>
                <TextInput
                    icon={<MagnifyingGlass />}
                    placeholder="Search name or paste address"
                    value={searchQuery}
                    onChange={(e: any) => {
                        setSearchQuery(e.target.value)
                        onChangeSearchQuery(e.target.value)
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
                        const isAlreadyUsed = selectedTokenAddresses.includes(
                            token.address
                        )
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
                                <Box direction="row" gap="small" align="center">
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