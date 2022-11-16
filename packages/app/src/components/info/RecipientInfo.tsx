import { useEffect, useState } from 'react'

import BaseAvatar from '../avatars/BaseAvatar'
import BaseInfoItem from './BaseInfoItem'
import { CERAMIC_NODE_ENDPOINT } from 'packages/app/config'
import CambrianProfileAbout from './CambrianProfileAbout'
import { CambrianProfileType } from '@cambrian/app/store/UserContext'
import { CeramicClient } from '@ceramicnetwork/http-client'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { getDIDfromAddress } from '@cambrian/app/services/ceramic/CeramicUtils'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'

interface RecipientInfoItemProps {
    address?: string
}

const RecipientInfoItem = ({ address }: RecipientInfoItemProps) => {
    const { currentUser } = useCurrentUserContext()
    const [cambrianProfile, setCambrianProfile] =
        useState<TileDocument<CambrianProfileType>>()

    useEffect(() => {
        fetchCeramicProfile()
    }, [currentUser, address])

    const fetchCeramicProfile = async () => {
        if (currentUser && address) {
            const ceramic = new CeramicClient(CERAMIC_NODE_ENDPOINT)
            const cambrianProfileDoc = (await TileDocument.deterministic(
                ceramic,
                {
                    controllers: [
                        getDIDfromAddress(address, currentUser.chainId),
                    ],
                    family: 'cambrian-profile',
                },
                { pin: true }
            )) as TileDocument<CambrianProfileType>
            setCambrianProfile(cambrianProfileDoc)
        }
    }
    return (
        <BaseInfoItem
            title={
                address
                    ? cambrianProfile?.content.name || 'Anon'
                    : 'To be defined'
            }
            subTitle={address && cambrianProfile?.content.title}
            dropContent={
                address && cambrianProfile ? (
                    <CambrianProfileAbout cambrianProfile={cambrianProfile} />
                ) : undefined
            }
            icon={
                cambrianProfile?.content.avatar ? (
                    <BaseAvatar pfpPath={cambrianProfile.content.avatar} />
                ) : (
                    <BaseAvatar address={address} />
                )
            }
        />
    )
}

export default RecipientInfoItem
