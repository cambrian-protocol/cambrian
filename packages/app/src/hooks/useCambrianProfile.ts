import { useEffect, useState } from 'react'

import { CambrianProfileType } from '../store/UserContext'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { useCurrentUserContext } from './useCurrentUserContext'

const useCambrianProfile = (did?: string) => {
    const { currentUser } = useCurrentUserContext()

    const [cambrianProfile, setCambrianProfile] =
        useState<CambrianProfileType>()

    useEffect(() => {
        initTemplaterProfile()
    }, [currentUser, did])

    const initTemplaterProfile = async () => {
        if (currentUser && did) {
            const cambrianProfile = (
                await TileDocument.deterministic(
                    //@ts-ignore
                    currentUser.ceramic,
                    {
                        controllers: [did],
                        family: 'cambrian-profile',
                    },
                    { pin: true }
                )
            ).content as CambrianProfileType
            if (cambrianProfile) setCambrianProfile(cambrianProfile)
        }
    }
    return [cambrianProfile]
}

export default useCambrianProfile
