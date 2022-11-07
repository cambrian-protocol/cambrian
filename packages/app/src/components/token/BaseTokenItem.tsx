import { Box, Text } from 'grommet'
import {
    fetchTokenInfo,
    parseTokenContractInfo,
} from '@cambrian/app/utils/helpers/tokens'
import { useEffect, useState } from 'react'

import BaseTokenLogo from './BaseTokenLogo'
import { TokenInfo } from '@uniswap/token-lists'
import tokenList from '@cambrian/app/public/tokenlists/uniswap_tokenlist.json'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'

type BaseTokenItemProps =
    | {
          tokenAddress?: string
          tokenInfo?: never
          onClick?: () => void
          icon?: JSX.Element
      }
    | {
          tokenAddress?: never
          tokenInfo?: TokenInfo
          onClick?: () => void
          icon?: JSX.Element
      }

const BaseTokenItem = ({
    tokenAddress,
    tokenInfo,
    onClick,
    icon,
}: BaseTokenItemProps) => {
    const { currentUser } = useCurrentUserContext()
    const [token, setToken] = useState<TokenInfo>()

    useEffect(() => {
        if (tokenInfo) {
            setToken(tokenInfo)
        } else if (tokenAddress) {
            initTokenAddress(tokenAddress)
        }
    }, [tokenAddress, tokenInfo])

    const initTokenAddress = async (tokenAddress: string) => {
        const _token = tokenList.tokens.find(
            (token) =>
                token.address === tokenAddress &&
                token.chainId === currentUser?.chainId
        )

        if (_token) {
            setToken(_token)
        } else if (currentUser) {
            setToken(
                parseTokenContractInfo(
                    await fetchTokenInfo(tokenAddress, currentUser.signer),
                    currentUser.chainId
                )
            )
        }
    }

    return (
        <Box pad={{ right: 'xsmall', vertical: 'xsmall' }}>
            <Box
                round="xsmall"
                pad={{ vertical: 'xsmall', horizontal: 'small' }}
                background={'background-front'}
                onClick={onClick}
                hoverIndicator
                focusIndicator={false}
                elevation="small"
            >
                <Box
                    height={{ min: '32px', max: '32px' }}
                    direction="row"
                    align="center"
                    gap="xsmall"
                >
                    <BaseTokenLogo token={token} />
                    {token ? (
                        <Text weight="bold">{token.symbol}</Text>
                    ) : (
                        <Text color="dark-4">???</Text>
                    )}
                    {icon}
                </Box>
            </Box>
        </Box>
    )
}

export default BaseTokenItem
