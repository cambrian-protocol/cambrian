import { TRILOBOT_ENDPOINT } from 'packages/app/config';
import { UserType } from "../store/UserContext"

export const call = async (
    route: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    auth?: UserType,
    body?: any
) => {
    try {
        const res = await fetch(`${TRILOBOT_ENDPOINT}/${route}`, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                Authorization: auth?.session?.serialize() || '',
            },
            body: body ? JSON.stringify(body) : undefined,
        })

        try {
            const result = await res.json()
            return result
        } catch (e) {
            if (res.status === 200) {
                return res
            } else {
                console.error(res.status, res.text)
                return undefined
            }
        }
    } catch (e) {
        console.error(e)
    }
}