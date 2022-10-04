import { CambrianProfileType } from '@cambrian/app/store/UserContext'

export const isNewProfile = (profile: CambrianProfileType) => {
    return (
        !profile ||
        !profile.name ||
        !profile.email ||
        profile.name.trim().length === 0 ||
        profile.email.trim().length === 0
    )
}
