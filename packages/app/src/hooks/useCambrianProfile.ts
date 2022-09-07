import { useEffect, useState } from 'react'

import { CambrianProfileType } from '../store/UserContext'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { ceramicInstance } from '../services/ceramic/CeramicUtils'
import { useCurrentUserContext } from './useCurrentUserContext'

const useCambrianProfile = (did?: string) => {
    const { currentUser } = useCurrentUserContext()

    const [cambrianProfile, setCambrianProfile] =
        useState<TileDocument<CambrianProfileType>>()

    useEffect(() => {
        initCambrianProfile()
    }, [currentUser, did])

    const initCambrianProfile = async () => {
        if (currentUser && did) {
            const cambrianProfile = (await TileDocument.deterministic(
                ceramicInstance(currentUser),
                {
                    controllers: [did],
                    family: 'cambrian-profile',
                },
                { pin: true }
            )) as TileDocument<CambrianProfileType>
            if (cambrianProfile) setCambrianProfile(cambrianProfile)
        }
    }
    return [cambrianProfile]
}

export default useCambrianProfile
