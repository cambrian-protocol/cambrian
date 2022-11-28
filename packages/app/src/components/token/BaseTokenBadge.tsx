import { Box, Text } from 'grommet'
import { useEffect, useState } from 'react'

import BaseTokenLogo from './BaseTokenLogo'
import { TokenAPI } from '@cambrian/app/services/api/Token.api'
import { TokenModel } from '@cambrian/app/models/TokenModel'
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
        } else if (tokenAddress && currentUser) {
            initTokenAddress(tokenAddress)
        }
    }, [tokenAddress, token, currentUser])

    const initTokenAddress = async (tokenAddress: string) => {
        if (currentUser) {
            setToken(
                await TokenAPI.getTokenInfo(
                    tokenAddress,
                    currentUser.web3Provider,
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
                    <BaseTokenLogo token={_token} />
                    {_token && <Text weight="bold">{_token.symbol}</Text>}
                    {icon}
                </Box>
            </Box>
        </Box>
    )
}

export default BaseTokenBadge
