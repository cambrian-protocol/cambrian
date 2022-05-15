import * as blockies from 'blockies-ts'

import { Box, Image } from 'grommet'
import { IconContext, User } from 'phosphor-react'

import React from 'react'

interface BaseAvatarProps {
    pfpPath?: string
    onClick?: () => void
    address?: string
    icon?: JSX.Element
}

const BaseAvatar = ({ address, pfpPath, icon, onClick }: BaseAvatarProps) => (
    <Box
        onClick={onClick}
        justify="center"
        align="center"
        focusIndicator={false}
        height={{ min: 'auto' }}
    >
        <Box
            elevation="small"
            width={{ min: '3em', max: '3em' }}
            height={{ min: '3em', max: '3em' }}
            background="brand"
            justify="center"
            align="center"
            round="xsmall"
            overflow="hidden"
        >
            <IconContext.Provider value={{ color: 'white', size: '24' }}>
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
                ) : icon ? (
                    icon
                ) : (
                    <User />
                )}
            </IconContext.Provider>
        </Box>
    </Box>
)

export default BaseAvatar
