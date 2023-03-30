import API, { DocumentModel } from '@cambrian/app/services/api/cambrian.api'
import { useEffect, useState } from 'react'

import BaseAvatar from '../avatars/BaseAvatar'
import BaseInfoItem from './BaseInfoItem'
import BaseSkeletonBox from '../skeletons/BaseSkeletonBox'
import CambrianProfileAbout from './CambrianProfileAbout'
import { CambrianProfileType } from '@cambrian/app/store/UserContext'
import { getDIDfromAddress } from '@cambrian/app/utils/did.utils'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'

interface RecipientInfoItemProps {
    address?: string
}

const RecipientInfoItem = ({ address }: RecipientInfoItemProps) => {
    const { currentUser } = useCurrentUserContext()
    const [cambrianProfile, setCambrianProfile] =
        useState<DocumentModel<CambrianProfileType>>()
    const [isInitialized, setIsInitialized] = useState(false)

    useEffect(() => {
        fetchCeramicProfile()
    }, [currentUser, address])

    const fetchCeramicProfile = async () => {
        setIsInitialized(false)
        if (currentUser && address) {
            const cambrianProfileDoc =
                await API.doc.deterministic<CambrianProfileType>({
                    controllers: [
                        getDIDfromAddress(address, currentUser.chainId),
                    ],
                    family: 'cambrian-profile',
                })
            setCambrianProfile(cambrianProfileDoc)
        }
        setIsInitialized(true)
    }
    return (
        <>
            {isInitialized ? (
                <BaseInfoItem
                    title={
                        address
                            ? cambrianProfile?.content.name || 'Anon'
                            : 'To be defined'
                    }
                    subTitle={address && cambrianProfile?.content.title}
                    dropContent={
                        address && cambrianProfile ? (
                            <CambrianProfileAbout
                                cambrianProfile={cambrianProfile}
                            />
                        ) : undefined
                    }
                    icon={
                        cambrianProfile?.content.avatar ? (
                            <BaseAvatar
                                pfpPath={cambrianProfile.content.avatar}
                            />
                        ) : (
                            <BaseAvatar address={address} />
                        )
                    }
                />
            ) : (
                <BaseSkeletonBox height="100%" />
            )}
        </>
    )
}

export default RecipientInfoItem
