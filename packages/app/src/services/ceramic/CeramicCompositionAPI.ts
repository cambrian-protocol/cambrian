import { CAMBRIAN_LIB_NAME, StageLibType, StageNames } from './CeramicStagehand'

import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { GENERAL_ERROR } from '../../constants/ErrorMessages'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { UserType } from '@cambrian/app/store/UserContext'
import { ceramicInstance } from './CeramicUtils'
import { cpLogger } from '../api/Logger.api'
import { createStage } from './../../utils/helpers/stageHelpers'
import initialComposer from '@cambrian/app/store/composer/composer.init'
import { pushUnique } from '../../utils/helpers/arrayHelper'

/** 
 API functions to maintain compositions and the composition-lib
*/
export default class CeramicCompositionAPI {
    user: UserType

    constructor(currentUser: UserType) {
        this.user = currentUser
    }

    loadCompositionLib = async () => {
        try {
            return (await TileDocument.deterministic(
                ceramicInstance(this.user),
                {
                    controllers: [this.user.did],
                    family: CAMBRIAN_LIB_NAME,
                    tags: [StageNames.composition],
                },
                { pin: true }
            )) as TileDocument<StageLibType>
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
        }
    }

    loadCompositionDoc = async (compositionStreamID: string) => {
        try {
            return (await TileDocument.load(
                ceramicInstance(this.user),
                compositionStreamID
            )) as TileDocument<CompositionModel>
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_LOAD_ERROR']
        }
    }

    /**
     * Creates a composition from either a passed composition or an enitrely new one and adds it to the users composition-lib.
     *
     * @param title
     * @param composition
     * @returns
     */
    createComposition = async (
        title: string,
        composition?: CompositionModel
    ): Promise<string> => {
        try {
            return await createStage(
                composition
                    ? composition
                    : {
                          title: title,
                          description: '',
                          flowElements: initialComposer.flowElements,
                          solvers: initialComposer.solvers,
                      },
                StageNames.composition,
                this.user
            )
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
        }
    }

    /***
     * Pushes compositionStreamID to recents as singleton. Removes pre-existent entry therefore keeps chronological order.
     *
     * @param compositionStreamID compositionStreamID
     */
    addRecentComposition = async (compositionStreamID: string) => {
        try {
            const compositionLib = await this.loadCompositionLib()
            const updatedCompositionLibContent = { ...compositionLib.content }
            await compositionLib.update({
                ...updatedCompositionLibContent,
                recents: pushUnique(
                    compositionStreamID,
                    updatedCompositionLibContent.recents
                ),
            })
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
        }
    }

    /**
     * Removes composition from composition-lib doc, and adds it to the composition-archive
     *
     * @param tag Composition Title / Unique tag
     */
    archiveComposition = async (tag: string) => {
        try {
            const compositionLib = await this.loadCompositionLib()
            const updatedCompositionLib = {
                ...compositionLib.content,
            }
            if (!updatedCompositionLib.archive)
                updatedCompositionLib.archive = { lib: [] }

            if (!updatedCompositionLib.archive.lib)
                updatedCompositionLib.archive = {
                    ...updatedCompositionLib.archive,
                    lib: [],
                }

            updatedCompositionLib.archive.lib.push(
                updatedCompositionLib.lib[tag]
            )

            delete updatedCompositionLib.lib[tag]
            await compositionLib.update({
                ...updatedCompositionLib,
            })
            return true
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
        }
    }

    /***
     * Adds composition to composition-lib doc and removes it from composition archive
     * TODO Update title if exists
     * @param compositionStreamID compositionStreamID
     */
    unarchiveComposition = async (compositionStreamID: string) => {
        try {
            const compositionLib = await this.loadCompositionLib()

            const updatedCompositionLib = {
                ...compositionLib.content,
            }
            const composition = (
                await ceramicInstance(this.user).loadStream(compositionStreamID)
            ).content as CompositionModel

            updatedCompositionLib.lib[composition.title] = compositionStreamID

            const updatedCompositionArchive = [
                ...updatedCompositionLib.archive.lib,
            ]

            await compositionLib.update({
                ...updatedCompositionLib,
                archive: {
                    ...updatedCompositionLib.archive,
                    lib: updatedCompositionArchive.filter(
                        (c) => c !== compositionStreamID
                    ),
                },
            })
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
        }
    }
}
