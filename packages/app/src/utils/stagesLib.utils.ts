import API, { DocumentModel } from "../services/api/cambrian.api"
import CambrianStagesLib, { CambrianStagesLibType } from "../classes/stageLibs/CambrianStagesLib"

import { GENERAL_ERROR } from "../constants/ErrorMessages"
import { UserType } from "../store/UserContext"
import _ from "lodash"
import { cpLogger } from "../services/api/Logger.api"

export const CAMBRIAN_LIB_NAME = 'cambrian-lib'

/**
 * Loads users stages-lib.
 *
 * @param currentUser
 * @returns stagesLib
 */
export const loadStagesLib = async (currentUser: UserType): Promise<DocumentModel<CambrianStagesLib>> => {
    try {
        if (!currentUser.session || !currentUser.did)
            throw GENERAL_ERROR['NO_CERAMIC_CONNECTION']

        const stagesLibDoc = await API.doc.deterministic<CambrianStagesLibType>(
            {
                controllers: [currentUser.did],
                family: CAMBRIAN_LIB_NAME,
                tags: ['stages']
            })
        if (!stagesLibDoc) throw GENERAL_ERROR['CERAMIC_LOAD_ERROR']

        const cambrianStagesLib = new CambrianStagesLib(stagesLibDoc.content)

        if (!_.isEqual(cambrianStagesLib.data, stagesLibDoc?.content)) {
            // Backup stagesLib and update Schema Version
            await API.doc.create(currentUser, stagesLibDoc?.content, {
                controllers: [currentUser.did],
                family: 'cambrianStagesLibBackup',
                tags: [stagesLibDoc?.content._schemaVer?.toString() || '0']
            },)
            await API.doc.updateStream(currentUser, stagesLibDoc.streamId, cambrianStagesLib.data)
        }

        return {
            streamId: stagesLibDoc.streamId,
            commitId: stagesLibDoc.commitId,
            content: cambrianStagesLib,
        }
    } catch (e) {
        cpLogger.push(e)
        throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
    }
}

