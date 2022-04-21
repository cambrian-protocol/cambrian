import * as blockies from 'blockies-ts'

import { Box, Image } from 'grommet'

import React from 'react'
import { User } from 'phosphor-react'

interface BaseAvatarProps {
    pfpPath?: string
    onClick?: () => void
    address?: string
}

const BaseAvatar = ({ address, pfpPath, onClick }: BaseAvatarProps) => (
    <Box
        onClick={onClick}
        justify="center"
        align="center"
        focusIndicator={false}
        height={{ min: 'auto' }}
    >
        <Box
            elevation="small"
            width={{ min: 'xxsmall', max: 'xxsmall' }}
            height={{ min: 'xxsmall', max: 'xxsmall' }}
            background="accent-2"
            justify="center"
            align="center"
            round="small"
            overflow="hidden"
        >
            {(pfpPath !== undefined && pfpPath !== '') ||
            address !== undefined ? (
                <Image
                    fit="cover"
                    src={
                        pfpPath !== undefined && pfpPath !== ''
                            ? pfpPath
                            : blockies.create({ seed: address }).toDataURL()
                    }
                />
            ) : (
                <User size="24" />
            )}
        </Box>
    </Box>
)

export default BaseAvatar
