import {
    ErrorMessageType,
    GENERAL_ERROR,
} from '@cambrian/app/constants/ErrorMessages'

import { ERROR_LOG_API_ENDPOINT } from 'packages/app/config'
import { getErrorMessage } from '@cambrian/app/utils/helpers/errorParsing'

export const cpLogger = {
    push: async (error: any): Promise<ErrorMessageType> => {
        const parsedError = getErrorMessage(error)
        if (parsedError.logLevel === undefined || parsedError.logLevel > 0) {
            console.error(error)
            if (process.env.NODE_ENV === 'production') {
                const data = { log: parsedError }
                try {
                    await fetch(ERROR_LOG_API_ENDPOINT, {
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                        },
                        method: 'POST',
                        body: JSON.stringify(data),
                    })
                } catch (e: any) {
                    console.error(e)
                    throw GENERAL_ERROR['POST_ERR_LOG_ERROR']
                }
            }
        }
        return parsedError
    },
}
