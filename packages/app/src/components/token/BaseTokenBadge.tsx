import { Box, Text } from 'grommet'
import { useEffect, useState } from 'react'

import BaseTokenLogo from './BaseTokenLogo'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { fetchTokenInfo } from '@cambrian/app/utils/helpers/tokens'
import tokenList from '@cambrian/app/public/tokenlists/uniswap_tokenlist.json'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'

type BaseTokenBadgeProps =
    | {
          tokenAddress?: string
          token?: never
          onClick?: () => void
          icon?: JSX.Element
      }
    | {
          tokenAddress?: never
          token?: TokenModel
          onClick?: () => void
          icon?: JSX.Element
      }

const BaseTokenBadge = ({
    tokenAddress,
    token,
    onClick,
    icon,
}: BaseTokenBadgeProps) => {
    const { currentUser } = useCurrentUserContext()
    const [_token, setToken] = useState<TokenModel>()

    useEffect(() => {
        if (token) {
            setToken(token)
        } else if (tokenAddress) {
            initTokenAddress(tokenAddress)
        }
    }, [tokenAddress, token])

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
                await fetchTokenInfo(tokenAddress, currentUser.web3Provider)
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
                    <BaseTokenLogo token={_token} />
                    {_token && <Text weight="bold">{_token.symbol}</Text>}
                    {icon}
                </Box>
            </Box>
        </Box>
    )
}

export default BaseTokenBadge
