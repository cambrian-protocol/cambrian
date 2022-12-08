import { StringHashmap } from '@cambrian/app/models/UtilityModels'

/**
 * Checks if passed value exists in map and attaches a counter to it if so.
 *
 * @param map
 * @param value
 * @returns
 */
export const getUniqueValue = (map: StringHashmap, value: string) => {
    let counter = 1
    let uniqueValue = value
    const titleHasmap: StringHashmap = {}

    // Flipping keys with values
    Object.keys(map).forEach((key) => (titleHasmap[map[key]] = key))
    // To o(1) check if title exists
    while (titleHasmap[uniqueValue]) {
        uniqueValue = value + ` (${counter++})`
    }
    return uniqueValue
}
