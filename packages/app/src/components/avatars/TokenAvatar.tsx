import { Box, Text, Tip } from 'grommet'

import { ConditionalWrapper } from '@cambrian/app/utils/helpers/ConditionalWrapper'
import React from 'react'
import { TokenModel } from '@cambrian/app/models/TokenModel'

interface TokenAvatar {
    token?: TokenModel
    showTip?: boolean
}

const TokenAvatar = ({ token, showTip }: TokenAvatar) => {
    return (
        <ConditionalWrapper
            condition={showTip}
            wrapper={(children) => (
                <Tip
                    content={`${token?.symbol || token?.name || ''} @ ${
                        token?.address
                    }`}
                    dropProps={{ align: { bottom: 'bottom', left: 'right' } }}
                >
                    {children}
                </Tip>
            )}
        >
            <Box
                justify="center"
                align="center"
                gap="xsmall"
                height={{ min: 'auto' }}
            >
                <Box
                    width={{ min: 'xxsmall', max: 'xxsmall' }}
                    height={{ min: 'xxsmall', max: 'xxsmall' }}
                    border={{ color: 'brand', size: 'small' }}
                    justify="center"
                    align="center"
                    round="full"
                    elevation="small"
                >
                    <Text size="small" weight="bold">
                        {token?.symbol || '?'}
                    </Text>
                </Box>
            </Box>
        </ConditionalWrapper>
    )
}

export default TokenAvatar
