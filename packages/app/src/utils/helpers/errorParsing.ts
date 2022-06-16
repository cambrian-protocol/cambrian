import {
    CONTRACT_ERROR,
    ErrorMessageType,
    METAMASK_ERROR,
} from '@cambrian/app/constants/ErrorMessages'

export function getErrorMessage(error: any): ErrorMessageType {
    // Error already has a logLevel, therefore it is an Error thrown by us
    if (error?.logLevel !== undefined) return error

    if (error?.code && METAMASK_ERROR[error.code]) {
        return {
            ...METAMASK_ERROR[error.code],
            error: error,
        }
    } else if (error?.code && CONTRACT_ERROR[error.code]) {
        return { ...CONTRACT_ERROR[error.code], error: error }
    } else {
        return {
            title: 'Oh Snap! Something went wrong, please try again.',
            message: 'Something went wrong, please try again.',
            error: error,
            logLevel: 1,
        }
    }
}
