import { Box, DropButton, Text } from 'grommet'

import ClipboardButton from '../buttons/ClipboardButton'
import React from 'react'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { ellipseAddress } from '@cambrian/app/utils/helpers/ellipseAddress'

interface TokenAvatar {
    token?: TokenModel
}

const TokenAvatar = ({ token }: TokenAvatar) => {
    return (
        <DropButton
            dropContent={
                <Box
                    direction="row"
                    align="center"
                    pad={{ vertical: 'xsmall', left: 'small', right: 'xsmall' }}
                    gap="small"
                >
                    <Text size="xsmall">
                        {ellipseAddress(token?.address, 10)}
                    </Text>
                    <ClipboardButton
                        value={token?.address || ''}
                        size="xsmall"
                    />
                </Box>
            }
            dropAlign={{ left: 'right' }}
        >
            <Box justify="center" height={{ min: 'auto' }}>
                <Box
                    width={{ min: '3em', max: '3em' }}
                    height={{ min: '3em', max: '3em' }}
                    border={{ color: 'brand', size: 'small' }}
                    justify="center"
                    align="center"
                    round="full"
                    elevation="small"
                >
                    <Text size="xsmall">{token?.symbol || '?'}</Text>
                </Box>
            </Box>
        </DropButton>
    )
}

export default TokenAvatar
