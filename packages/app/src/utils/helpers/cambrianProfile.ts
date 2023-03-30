import API, { DocumentModel } from '@cambrian/app/services/api/cambrian.api'

import { CambrianProfileType } from '@cambrian/app/store/UserContext'

export const getCambrianProfile = async (
    did: string,
) => {
    const cambrianProfile = await API.doc.deterministic<CambrianProfileType>(
        {
            controllers: [did],
            family: 'cambrian-profile',
        }
    )
    if (cambrianProfile !== undefined) return cambrianProfile
}

export const getCambrianProfiles = async (
    dids: string[],
): Promise<(DocumentModel<CambrianProfileType>)[]> => {
    const profiles = await Promise.all(
        dids.map(async (did) => {
            const profile = await getCambrianProfile(did)
            if (profile) return profile
        })
    )
    return profiles.filter((profile) => profile !== undefined) as DocumentModel<CambrianProfileType>[]
}
