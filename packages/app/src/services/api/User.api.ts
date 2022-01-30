import { CURRENT_USER_KEY, post } from '@cambrian/app/config/api/axios.config'

// TODO Session expiring
// TODO Roles
export type UserRole = 'Keeper' | 'Arbitrator' | 'Worker' | 'Public'

export type UserType = {
    address: string
    color: string
    role: UserRole
    access_token: string
    expires_in?: number
}

export const UserAPI = {
    getSessionUser: (): UserType | null => {
        const storedUserEncoded = sessionStorage.getItem(CURRENT_USER_KEY)
        if (storedUserEncoded) {
            return JSON.parse(storedUserEncoded)
        }
        return null
    },
    authenticateSession: async (address: string) => {
        // TODO fetch user access token. Role should be public on init and overwritten on proposal fetch
        // const response = await post('/login', { address })

        const randomProfileColor = `rgb(${Math.floor(
            Math.random() * 256
        )},${Math.floor(Math.random() * 256)},${Math.floor(
            Math.random() * 256
        )})`

        // Dummy
        const currentUser: UserType = {
            address: address,
            color: randomProfileColor,
            access_token: 'dummy_token',
            role: 'Public',
        }
        sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser))

        return currentUser
    },
    logoutSession: () => {
        sessionStorage.removeItem(CURRENT_USER_KEY)
    },
}
