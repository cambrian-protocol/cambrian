import {
    CONTRACT_ERROR,
    ErrorMessageType,
    METAMASK_ERROR,
} from '@cambrian/app/constants/ErrorMessages'

export function getErrorMessage(error: any): ErrorMessageType {
    // Error already has a logLevel, therefore it is an Error thrown by us
    if (error?.logLevel !== undefined) return error

    // Check if Error is nested first
    if (error?.error) {
        return {
            message: error.error.message,
            info: error.error.info,
            error: error,
            code: error.error.code,
            logLevel: 1,
        }
    } else if (error?.code && METAMASK_ERROR[error.code]) {
        return {
            ...METAMASK_ERROR[error.code],
            error: error,
            info: error.message || undefined,
        }
    } else if (error?.code && CONTRACT_ERROR[error.code]) {
        return { ...CONTRACT_ERROR[error.code], error: error }
    } else {
        return {
            message: error.message || 'Something went wrong',
            info: error.info || 'Please try again later...',
            error: error,
            logLevel: 1,
        }
    }
}
