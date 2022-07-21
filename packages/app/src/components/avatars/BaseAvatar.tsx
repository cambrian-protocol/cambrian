import * as blockies from 'blockies-ts'

import { Box, Image } from 'grommet'
import { IconContext, User } from 'phosphor-react'

import React from 'react'

interface BaseAvatarProps {
    pfpPath?: string
    onClick?: () => void
    address?: string
    icon?: JSX.Element
    size?: 'large' | 'medium'
}

const BaseAvatar = ({
    address,
    pfpPath,
    icon,
    onClick,
    size,
}: BaseAvatarProps) => {
    const iconSize = size === 'large' ? '64' : '24'

    return (
        <Box
            onClick={onClick}
            justify="center"
            align="center"
            focusIndicator={false}
            height={{ min: 'auto' }}
        >
            <Box
                elevation="small"
                width={
                    size === 'large'
                        ? { min: 'small', max: 'small' }
                        : size === 'medium'
                        ? { min: '6em', max: '6em' }
                        : { min: '3em', max: '3em' }
                }
                height={
                    size === 'large'
                        ? { min: 'small', max: 'small' }
                        : size === 'medium'
                        ? { min: '6em', max: '6em' }
                        : { min: '3em', max: '3em' }
                }
                background="brand"
                justify="center"
                align="center"
                round="xsmall"
                overflow="hidden"
            >
                <IconContext.Provider
                    value={{ color: 'white', size: iconSize }}
                >
                    {(pfpPath !== undefined && pfpPath !== '') ||
                    address !== undefined ? (
                        <Image
                            fit="cover"
                            src={
                                pfpPath !== undefined && pfpPath !== ''
                                    ? pfpPath
                                    : blockies
                                          .create({ seed: address })
                                          .toDataURL()
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
}

export default BaseAvatar
