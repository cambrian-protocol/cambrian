import { Box, Text, Tip } from 'grommet'
import { Coin, IconContext } from 'phosphor-react'

import React from 'react'
import { TokenModel } from '@cambrian/app/models/TokenModel'

interface TokenAvatar {
    token: TokenModel
}

const TokenAvatar = ({ token }: TokenAvatar) => {
    return (
        <Tip
            content={`Token name: ${token.tokenName}`}
            dropProps={{ align: { bottom: 'bottom', left: 'right' } }}
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
                    background="darkBlue"
                    justify="center"
                    align="center"
                    round="full"
                >
                    <IconContext.Provider value={{ size: '24' }}>
                        <Coin />
                    </IconContext.Provider>
                </Box>
                <Box justify="center" align="center">
                    <Text size="small" weight="bold">
                        {token.tokenSymbol}
                    </Text>
                </Box>
            </Box>
        </Tip>
    )
}

export default TokenAvatar
