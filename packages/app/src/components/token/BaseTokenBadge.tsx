import { Box, Text } from 'grommet'
import { useEffect, useState } from 'react'

import BaseSkeletonBox from '../skeletons/BaseSkeletonBox'
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
    const [isInitialized, setIsInitialized] = useState(false)

    useEffect(() => {
        setIsInitialized(false)
        if (token) {
            setToken(token)
            setIsInitialized(true)
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
        setIsInitialized(true)
    }

    return (
        <Box pad={{ right: 'xsmall', vertical: 'xsmall' }}>
            <Box
                onClick={onClick}
                hoverIndicator
                round="xsmall"
                background={'background-front'}
                focusIndicator={false}
            >
                {isInitialized ? (
                    <Box
                        direction="row"
                        align="center"
                        gap="xsmall"
                        pad={{ vertical: 'xsmall', horizontal: 'small' }}
                        round="xsmall"
                        elevation="small"
                    >
                        <BaseTokenLogo token={_token} />
                        {_token && <Text weight="bold">{_token.symbol}</Text>}
                        {icon}
                    </Box>
                ) : (
                    <BaseSkeletonBox
                        pad={{ vertical: 'xsmall', horizontal: 'small' }}
                        width="xsmall"
                    >
                        <Box
                            direction="row"
                            align="center"
                            gap="xsmall"
                            height={{ max: '3.6em', min: '3.6em' }}
                        ></Box>
                    </BaseSkeletonBox>
                )}
            </Box>
        </Box>
    )
}

export default BaseTokenBadge
