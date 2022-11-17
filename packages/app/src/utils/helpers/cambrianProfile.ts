import { CambrianProfileType, UserType } from '@cambrian/app/store/UserContext'

import { TileDocument } from '@ceramicnetwork/stream-tile'
import { ceramicInstance } from '@cambrian/app/services/ceramic/CeramicUtils'

export const getCambrianProfile = async (
    did: string,
    currentUser: UserType
) => {
    const cambrianProfile = (await TileDocument.deterministic(
        ceramicInstance(currentUser),
        {
            controllers: [did],
            family: 'cambrian-profile',
        },
        { pin: true }
    )) as TileDocument<CambrianProfileType>

    return cambrianProfile
}

export const getCambrianProfiles = async (
    dids: string[],
    currentUser: UserType
) => {
    return await Promise.all(
        dids.map(async (did) => {
            return await getCambrianProfile(did, currentUser)
        })
    )
}
