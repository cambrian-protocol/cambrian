export const required = [
    (value: string) =>
        value == null || value === undefined || value.length === 0
            ? 'is required'
            : undefined,
]

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
