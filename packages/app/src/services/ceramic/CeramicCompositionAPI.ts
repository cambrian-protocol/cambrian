import { StageLibType, StageNames } from '../../models/StageModel'
import { ceramicInstance, createStage, loadStageLib } from './CeramicUtils'

import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { GENERAL_ERROR } from '../../constants/ErrorMessages'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpLogger } from '../api/Logger.api'
import initialComposer from '@cambrian/app/store/composer/composer.init'

/** 
 API functions to maintain compositions and the users composition-lib.
*/
export default class CeramicCompositionAPI {
    user: UserType

    constructor(currentUser: UserType) {
        this.user = currentUser
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

    /**
     * Removes composition from composition-lib doc, and adds it to the composition-archive
     *
     * @param tag Composition Title / Unique tag
     */
    archiveComposition = async (tag: string) => {
        try {
            const compositionLib = await loadStageLib<StageLibType>(
                this.user,
                StageNames.composition
            )
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
            const compositionLib = await loadStageLib<StageLibType>(
                this.user,
                StageNames.composition
            )

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
