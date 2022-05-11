import { Box, Text } from 'grommet'

import React from 'react'
import { TokenModel } from '@cambrian/app/models/TokenModel'

interface TokenAvatar {
    token?: TokenModel
}

const TokenAvatar = ({ token }: TokenAvatar) => {
    return (
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
    )
}

export default TokenAvatar
