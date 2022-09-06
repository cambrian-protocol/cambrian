import {
    CAMBRIAN_LIB_NAME,
    StageModel,
    StageNames,
} from '@cambrian/app/services/ceramic/CeramicStagehand'

import { GENERAL_ERROR } from '@cambrian/app/constants/ErrorMessages'
import { StageLibType } from './../../services/ceramic/CeramicStagehand'
import { StringHashmap } from '@cambrian/app/models/UtilityModels'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { UserType } from '@cambrian/app/store/UserContext'
import { ceramicInstance } from '@cambrian/app/services/ceramic/CeramicUtils'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { loadStageLib as loadStageLibDoc } from './stageHelpers'

export const getUniqueTag = (stageLib: StringHashmap, currentTag: string) => {
    let counter = 1
    let uniqueTag = currentTag
    while (stageLib[uniqueTag]) {
        uniqueTag = currentTag + ` (${counter++})`
    }
    return uniqueTag
}

/**
 * Searches and updates a key in a hashmap from the passed value.
 *
 * @param value Value of the key/tag which needs to be updated
 * @param updatedKey Tag
 * @param currentMap
 * @returns actual tag with counter suffix if tag existed. map: updated map
 *
 */
export const updateKeyFromValue = (
    value: string,
    updatedKey: string,
    currentMap?: StringHashmap
): { key: string; map: StringHashmap } => {
    let updatedMap: StringHashmap = {}
    let uniqueKey = updatedKey
    if (currentMap) {
        updatedMap = {
            ...currentMap,
        }
        const currentTag = Object.keys(updatedMap).find(
            (tag) => updatedMap[tag] === value
        )
        if (!currentTag) throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
        uniqueKey = getUniqueTag(updatedMap, updatedKey)
        updatedMap[uniqueKey] = value
        delete updatedMap[currentTag]
    } else {
        updatedMap[uniqueKey] = value
    }
    return { key: uniqueKey, map: updatedMap }
}

export const loadStageLib = async (
    currentUser: UserType,
    stageName: StageNames
) => {
    return (await TileDocument.deterministic(
        ceramicInstance(currentUser),
        {
            controllers: [currentUser.did],
            family: CAMBRIAN_LIB_NAME,
            tags: [stageName],
        },
        { pin: true }
    )) as TileDocument<StageLibType>
}

export const createStage = async (
    stage: StageModel,
    stageName: StageNames,
    currentUser: UserType
): Promise<string> => {
    try {
        const stageLibDoc = await loadStageLibDoc(currentUser, stageName)

        let uniqueTitle = stage.title
        // Overwrite title if tag wasn't unique
        if (stageLibDoc.content.lib) {
            uniqueTitle = getUniqueTag(stageLibDoc.content.lib, stage.title)
        }

        if (uniqueTitle !== stage.title) {
            stage = { ...stage, title: uniqueTitle }
        }

        const currentDoc = await TileDocument.deterministic(
            ceramicInstance(currentUser),
            {
                controllers: [currentUser.did],
                family: `cambrian-${stageName}`,
                tags: [uniqueTitle],
            },
            { pin: true }
        )
        await currentDoc.update(stage)
        const streamID = currentDoc.id.toString()

        let updatedStageLib: StageLibType = {
            lib: {},
            recents: [],
            archive: { lib: [] },
        }
        if (
            stageLibDoc.content !== null &&
            typeof stageLibDoc.content === 'object' &&
            stageLibDoc.content.lib
        ) {
            updatedStageLib = {
                ...stageLibDoc.content,
                lib: { ...stageLibDoc.content.lib, [uniqueTitle]: streamID },
            }
        } else {
            updatedStageLib = {
                ...updatedStageLib,
                lib: { ...stageLibDoc.content.lib, [uniqueTitle]: streamID },
            }
        }
        await stageLibDoc.update(updatedStageLib)

        return streamID
    } catch (e) {
        cpLogger.push(e)
        throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
    }
}

export const updateStage = async (
    streamID: string,
    updatedStage: StageModel,
    stageName: StageNames,
    currentUser: UserType
): Promise<string> => {
    try {
        const currentStage: TileDocument<StageModel> = await TileDocument.load(
            ceramicInstance(currentUser),
            streamID
        )

        const cleanedUserTitle = updatedStage.title.trim()
        if (currentStage.content.title !== cleanedUserTitle) {
            // Title has changed - stageLib and metaTag must be updated
            const stageLibDoc = await loadStageLibDoc(currentUser, stageName)

            if (
                stageLibDoc.content === null ||
                typeof stageLibDoc.content !== 'object'
            ) {
                throw GENERAL_ERROR['STAGE_LIB_ERROR']
            }

            const { key, map } = updateKeyFromValue(
                streamID,
                cleanedUserTitle,
                stageLibDoc.content.lib
            )

            await currentStage.update(
                { ...updatedStage, title: key },
                { ...currentStage.metadata, tags: [key] },
                { pin: true }
            )
            await stageLibDoc.update({
                ...stageLibDoc.content,
                lib: map,
            })
            return key
        } else {
            await currentStage.update({
                ...updatedStage,
                title: cleanedUserTitle,
            })
            return cleanedUserTitle
        }
    } catch (e) {
        cpLogger.push(e)
        throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
    }
}
