import API, { DocumentModel } from "./../api/cambrian.api";

import { CompositionModel } from "../../models/CompositionModel";
import { GENERAL_ERROR } from "../../constants/ErrorMessages";
import { StageNames } from "../../models/StageModel";
import { UserType } from "../../store/UserContext";
import { cpLogger } from "./../api/Logger.api";
import { loadStagesLib } from "../../utils/stagesLib.utils";

export default class CompositionService {

    async create(auth: UserType, composition: CompositionModel) {
        try {
            if (!auth.session || !auth.did)
                throw GENERAL_ERROR['NO_CERAMIC_CONNECTION']

            const stageMetadata = {
                controllers: [auth.did],
                family: `composition`,
                tags: [composition.title]
            }

            const stageIds = await API.doc.generateStreamAndCommitId(auth, stageMetadata)

            if (!stageIds) throw GENERAL_ERROR['CERAMIC_LOAD_ERROR']

            const stagesLibDoc = await loadStagesLib(auth)
            const uniqueTitle = stagesLibDoc.content.addStage(stageIds.streamId, composition.title, StageNames.composition)
            await API.doc.updateStream(auth, stagesLibDoc.streamID, stagesLibDoc.content.data)

            const res = await API.doc.create<CompositionModel>(auth, { ...composition, title: uniqueTitle }, { ...stageMetadata, tags: [uniqueTitle] })

            if (!res) throw new Error('Failed to create a Composition')

            return { streamID: res.streamID, title: uniqueTitle }
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
        }
    }

    async save(auth: UserType, compositionDoc: DocumentModel<CompositionModel>) {
        try {
            await API.doc.updateStream(auth, compositionDoc.streamID, compositionDoc.content, { ...compositionDoc.metadata, tags: [compositionDoc.content.title] })
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