import { StageLibType, StageModel, StageNames } from '../../models/StageModel'
import {
    getUniqueTag,
    updateKeyFromValue,
} from '@cambrian/app/utils/helpers/hashmapHelper'

import { CERAMIC_NODE_ENDPOINT } from 'packages/app/config'
import { CeramicClient } from '@ceramicnetwork/http-client'
import { GENERAL_ERROR } from '@cambrian/app/constants/ErrorMessages'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpLogger } from '../api/Logger.api'

export const CAMBRIAN_LIB_NAME = 'cambrian-lib'

export const ceramicInstance = (currentUser: UserType) => {
    const ceramicClient = new CeramicClient(CERAMIC_NODE_ENDPOINT)
    ceramicClient.did = currentUser.session.did
    return ceramicClient
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
        const stageLibDoc = await loadStageLib(currentUser, stageName)

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
            const stageLibDoc = await loadStageLib(currentUser, stageName)

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

export const clearStages = async (currentUser: UserType, stage: StageNames) => {
    const stageLib = await TileDocument.deterministic(
        ceramicInstance(currentUser),
        {
            controllers: [currentUser.did],
            family: CAMBRIAN_LIB_NAME,
            tags: [stage],
        },
        { pin: true }
    )
    stageLib.update({})
}