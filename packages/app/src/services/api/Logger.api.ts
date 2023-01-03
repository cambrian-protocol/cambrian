import { ERROR_LOG_API_ENDPOINT } from 'packages/app/config'
import { GENERAL_ERROR } from '@cambrian/app/constants/ErrorMessages'

export const cpLogger = {
    pushError: async (error: any) => {
        try {
            console.error(error)
            await fetch(ERROR_LOG_API_ENDPOINT, {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                method: 'POST',
                body: JSON.stringify({ log: error }),
            })
        } catch (e) {
            console.error(e)
            throw GENERAL_ERROR['POST_ERR_LOG_ERROR']
        }
    },
}
