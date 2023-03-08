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
                throw GENERAL_ERROR['UNAUTHORIZED']

            const res = await createStage(auth, composition
                ? { ...composition }
                : {
                    schemaVer: SCHEMA_VER['composition'],
                    title: title,
                    description: '',
                    flowElements: initialComposer.flowElements,
                    solvers: initialComposer.solvers,
                },)
            if (!res) throw new Error('Stage create error: failed to create composition')

            return res
        } catch (e) {
            cpLogger.push(e)
        }
    }

    async update(auth: UserType, currentCompositionDoc: DocumentModel<CompositionModel>, updatedComposition: CompositionModel): Promise<string | undefined> {
        try {
            if (!auth.session || !auth.did)
                throw GENERAL_ERROR['UNAUTHORIZED']

            const res = await updateStage(auth, currentCompositionDoc, updatedComposition)
            if (!res) throw new Error('Stage update error: failed to update composition')

            return res
        } catch (e) {
            cpLogger.push(e)
        }
    }

    async archive(auth: UserType, compositionStreamID: string) {
        try {
            if (!auth.session || !auth.did)
                throw GENERAL_ERROR['UNAUTHORIZED']

            const stagesLibDoc = await loadStagesLib(auth)
            stagesLibDoc.content.compositions.archiveStage(compositionStreamID)
            const res = await API.doc.updateStream(auth, stagesLibDoc.streamID, stagesLibDoc.content.data)
            if (!res || res.status !== 200) throw new Error('Stage archive error: failed to archive composition')
            return res
        } catch (e) {
            cpLogger.push(e)
        }
    }
}