import { archiveStage, createStage } from './CeramicUtils'

import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { GENERAL_ERROR } from '../../constants/ErrorMessages'
import { StageNames } from '../../models/StageModel'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpLogger } from '../api/Logger.api'
import initialComposer from '@cambrian/app/store/composer/composer.init'
import { ulid } from 'ulid'

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
            const id = ulid()
            return await createStage(
                composition
                    ? { ...composition, id: id }
                    : {
                          id: id,
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
     * @param streamId
     */
    archiveComposition = async (streamId: string) => {
        try {
            await archiveStage(this.user, streamId, StageNames.composition)
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
        /*  try {
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
        } */
    }
}
