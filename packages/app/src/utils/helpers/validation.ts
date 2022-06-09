import { ethers } from 'ethers'

export const isBoolean = (value: string) => {
    if (value != null || value !== undefined) {
        const cleanLowercaseValue = value.toLowerCase().trim()
        if (cleanLowercaseValue === 'true' || cleanLowercaseValue === 'false') {
            return true
        }
    }
    return false
}

export const isNumeric = (value: string) => {
    return /^\+?([0-9]\d*)$/.test(value)
}

// TODO WIP Improve
export const isArray = (value: string) => {
    if (value != null || value !== undefined) {
        const cleanLowercaseValue = value.toLowerCase().trim()
        if (
            cleanLowercaseValue.startsWith('[') &&
            cleanLowercaseValue.endsWith(']')
        ) {
            return true
        }
    }
    return false
}

export const isAddress = (address: string) => {
    if (
        address.length !== 42 ||
        !address.startsWith('0x') ||
        !ethers.utils.isAddress(address)
    ) {
        return 'Invalid address'
    }
}

export const validateAddress = [
    (value: string) => {
        return isAddress(value)
    },
]

export const isRequired = (value: string) => {
    if (
        value == null ||
        value === undefined ||
        value.length === 0 ||
        value.trim() === ''
    ) {
        return 'required'
    }
}
