import * as blockies from 'blockies-ts'

import { Box, Image } from 'grommet'
import { IconContext, User } from 'phosphor-react'
import React, { useEffect, useState } from 'react'

import { CERAMIC_NODE_ENDPOINT } from 'packages/app/config'
import { CambrianProfileType } from '@cambrian/app/store/UserContext'
import { CeramicClient } from '@ceramicnetwork/http-client'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'

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
    const { currentUser } = useCurrentUserContext()
    const ceramic = new CeramicClient(CERAMIC_NODE_ENDPOINT)
    const iconSize = size === 'large' ? '64' : '24'
    const [cambrianProfileAvatar, setCambrianProfileAvatar] = useState<string>()

    useEffect(() => {
        fetchCeramicProfile()
    }, [currentUser])

    const fetchCeramicProfile = async () => {
        if (currentUser) {
            const cambrianProfileDoc = (await TileDocument.deterministic(
                ceramic,
                {
                    controllers: [
                        `did:pkh:eip155:${currentUser.chainId}:${address}`,
                    ],
                    family: 'cambrian-profile',
                },
                { pin: true }
            )) as TileDocument<CambrianProfileType>
            if (
                cambrianProfileDoc.content.avatar &&
                cambrianProfileDoc.content.avatar !== ''
            ) {
                setCambrianProfileAvatar(cambrianProfileDoc.content.avatar)
            }
        }
    }

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
                                cambrianProfileAvatar
                                    ? cambrianProfileAvatar
                                    : pfpPath !== undefined && pfpPath !== ''
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
