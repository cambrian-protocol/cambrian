import { StageModel, StageNames } from "../models/StageModel";

import API from "../services/api/cambrian.api";
import { GENERAL_ERROR } from "../constants/ErrorMessages";
import { UserType } from "../store/UserContext";
import { cpLogger } from "../services/api/Logger.api";
import { loadStagesLib } from "./stagesLib.utils";

export const createStage = async (
    auth: UserType,
    stage: StageModel,
    stageName: StageNames,
): Promise<{ streamID: string; title: string }> => {
    try {
        if (!auth.session || !auth.did)
            throw GENERAL_ERROR['NO_CERAMIC_CONNECTION']

        const stageMetadata = {
            controllers: [auth.did],
            family: `cambrian-${stageName}`,
            tags: [stage.title]
        }

        const stageIds = await API.doc.generateStreamAndCommitId(auth, stageMetadata)

        if (!stageIds) throw GENERAL_ERROR['CERAMIC_LOAD_ERROR']

        const stagesLibDoc = await loadStagesLib(auth)
        const uniqueTitle = stagesLibDoc.content.addStage(stageIds.streamId, stage.title, stageName)

        await API.doc.updateStream(auth, stageIds.streamId, { ...stage, title: uniqueTitle }, { ...stageMetadata, tags: [uniqueTitle] })

        await API.doc.updateStream(auth, stagesLibDoc.streamID, stagesLibDoc.content)

        return { streamID: stageIds.streamId, title: uniqueTitle }
    } catch (e) {
        cpLogger.push(e)
        throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
    }
}

