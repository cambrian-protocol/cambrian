import { StringHashmap } from '@cambrian/app/models/UtilityModels'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'

/**
 * Checks if passed key exists in map and attaches a counter to the key if so.
 *
 * @param map
 * @param key
 * @returns
 */
export const getUniqueTag = (map: StringHashmap, key: string) => {
    let counter = 1
    let uniqueTag = key
    while (map[uniqueTag]) {
        uniqueTag = key + ` (${counter++})`
    }
    return uniqueTag
}

/**
 * Searches and updates a key in a hashmap from the passed value.
 *
 * @param value Value of the key/tag which needs to be updated
 * @param updatedKey Tag
 * @param map
 * @returns actual tag with counter suffix if tag existed. map: updated map
 *
 */
export const updateKeyFromValue = (
    value: string,
    updatedKey: string,
    map?: StringHashmap,
    archiveMap?: StringHashmap
): { key: string; map: StringHashmap } => {
    let updatedMap: StringHashmap = {}
    let uniqueKey = updatedKey
    try {
        if (map) {
            updatedMap = {
                ...map,
            }
            const currentTag = Object.keys(updatedMap).find(
                (tag) => updatedMap[tag] === value
            )
            if (!currentTag)
                throw new Error(`Key not found. ${value} ${updatedKey} ${map}`)
            uniqueKey = getUniqueTag(
                { ...updatedMap, ...archiveMap },
                updatedKey
            )
            updatedMap[uniqueKey] = value
            delete updatedMap[currentTag]
        } else {
            updatedMap[uniqueKey] = value
        }
    } catch (e) {
        cpLogger.push(e)
    }
    return { key: uniqueKey, map: updatedMap }
}
