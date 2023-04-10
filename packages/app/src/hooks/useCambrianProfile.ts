import API, { DocumentModel } from '../services/api/cambrian.api'
import { useEffect, useState } from 'react'

import { CambrianProfileType } from '../store/UserContext'
import { useCurrentUserContext } from './useCurrentUserContext'

const useCambrianProfile = (did?: string) => {
    const { currentUser } = useCurrentUserContext()

    const [cambrianProfile, setCambrianProfile] =
        useState<DocumentModel<CambrianProfileType>>()

    useEffect(() => {
        initCambrianProfile()
    }, [currentUser, did])

    const initCambrianProfile = async () => {
        if (currentUser && did) {
            const cambrianProfile = await API.doc.deterministic<CambrianProfileType>(
                {
                    controllers: [did],
                    family: 'cambrian-profile',
                },
            )
            if (cambrianProfile) setCambrianProfile(cambrianProfile)
        }
    }
    return [cambrianProfile]
}

export default useCambrianProfile
