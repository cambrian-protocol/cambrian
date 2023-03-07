import API, { DocumentModel } from "./../api/cambrian.api";
import { createStage, updateStage } from "@cambrian/app/utils/stage.utils";

import { CompositionModel } from "../../models/CompositionModel";
import { GENERAL_ERROR } from "../../constants/ErrorMessages";
import { SCHEMA_VER } from "packages/app/config";
import { UserType } from "../../store/UserContext";
import { cpLogger } from "./../api/Logger.api";
import initialComposer from "@cambrian/app/store/composer/composer.init";
import { loadStagesLib } from "../../utils/stagesLib.utils";

export default class CompositionService {

    async create(auth: UserType, title: string, composition?: CompositionModel) {
        try {
            if (!auth.session || !auth.did)
                throw GENERAL_ERROR['NO_CERAMIC_CONNECTION']

            return await createStage(auth, composition
                ? { ...composition }
                : {
                    schemaVer: SCHEMA_VER['composition'],
                    title: title,
                    description: '',
                    flowElements: initialComposer.flowElements,
                    solvers: initialComposer.solvers,
                },)
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
        }
    }

    async update(auth: UserType, currentCompositionDoc: DocumentModel<CompositionModel>, updatedComposition: CompositionModel): Promise<string | undefined> {
        try {
            return await updateStage(auth, currentCompositionDoc, updatedComposition)
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
        }
    }

    async archive(auth: UserType, compositionStreamID: string) {
        try {
            const stagesLibDoc = await loadStagesLib(auth)
            stagesLibDoc.content.compositions.archiveStage(compositionStreamID)
            return await API.doc.updateStream(auth, stagesLibDoc.streamID, stagesLibDoc.content.data)
        } catch (e) {
            console.error(e)
        }
    }
}