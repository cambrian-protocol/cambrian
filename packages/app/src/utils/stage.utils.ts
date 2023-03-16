import API, { DocumentModel } from "../services/api/cambrian.api";
import { StageModel, StageNames } from "../models/StageModel";

import { CambrianStagesLibType } from '../classes/stageLibs/CambrianStagesLib';
import { CompositionModel } from '@cambrian/app/models/CompositionModel';
import { FlexInputFormType } from "../ui/templates/forms/TemplateFlexInputsForm";
import { GENERAL_ERROR } from "../constants/ErrorMessages";
import { SlotTagModel } from "../classes/Tags/SlotTag";
import { UserType } from "../store/UserContext";
import { cpLogger } from '../services/api/Logger.api';
import { loadStagesLib } from './stagesLib.utils';
import { ulid } from "ulid";

export const isCompositionStage = (stage: any) => stage.solvers !== undefined
export const isTemplateStage = (stage: any) => stage.composition !== undefined
export const isProposalStage = (stage: any) => stage.template !== undefined


export const getFormFlexInputs = (composition: CompositionModel): { formFlexInputs: FlexInputFormType[], isCollateralFlex: boolean } => {
    let isCollateralFlex = false
    const formFlexInputs: FlexInputFormType[] = []
    composition.solvers.forEach((solver) => {
        Object.keys(solver.slotTags).forEach((tagId) => {
            if (solver.slotTags[tagId].isFlex !== 'None') {
                if (tagId === 'collateralToken') {
                    isCollateralFlex = true
                } else {
                    formFlexInputs.push({
                        ...(solver.slotTags[tagId] as SlotTagModel),
                        tagId: tagId,
                        value:
                            tagId === 'timelockSeconds'
                                ? solver.config.timelockSeconds?.toString() ||
                                ''
                                : '', // TODO this is stupid
                    })
                    formFlexInputs.push()
                }
            }
        })
    })

    return {
        formFlexInputs: formFlexInputs,
        isCollateralFlex: isCollateralFlex,
    }
}

export const createStage = async <T extends StageModel>(auth: UserType, stage: T,) => {
    try {
        if (!auth.session || !auth.did)
            throw GENERAL_ERROR['UNAUTHORIZED']

        const tempUlid = ulid()
        const stageMetadata = {
            controllers: [auth.did],
            family: `template`,
            tags: [tempUlid] // To generate a unique streamID
        }

        const stageIds = await API.doc.deterministic(stageMetadata)
        if (!stageIds) throw GENERAL_ERROR['CERAMIC_LOAD_ERROR']

        const stagesLibDoc = await loadStagesLib(auth)
        let uniqueTitle = stage.title
        if (isCompositionStage(stage)) {
            uniqueTitle = stagesLibDoc.content.addStage(stageIds.streamID, stage.title, StageNames.composition)
        } else if (isTemplateStage(stage)) {
            uniqueTitle = stagesLibDoc.content.addStage(stageIds.streamID, stage.title, StageNames.template)
        } else if (isProposalStage(stage)) {
            uniqueTitle = stagesLibDoc.content.addStage(stageIds.streamID, stage.title, StageNames.proposal)
        }
        const res = await API.doc.updateStream<T>(auth, stageIds.streamID, { ...stage, title: uniqueTitle }, { ...stageMetadata, tags: [uniqueTitle] })
        if (!res) throw new Error('Stage create error: failed to create stage')

        const updateRes = await API.doc.updateStream<CambrianStagesLibType>(auth, stagesLibDoc.streamID, stagesLibDoc.content.data)
        if (!updateRes || updateRes.status !== 200) throw new Error('StageLib update error: failed to update stagesLib')

        return { streamID: stageIds.streamID, title: uniqueTitle }
    } catch (e) {
        cpLogger.push(e)
    }
}

export const updateStage = async <T extends StageModel>(
    auth: UserType,
    currentStageDoc: DocumentModel<T>,
    updatedStage: T,
): Promise<string | undefined> => {
    try {
        let uniqueTitle = updatedStage.title
        if (currentStageDoc.content.title !== updatedStage.title) {
            const stagesLibDoc = await loadStagesLib(auth)
            if (isCompositionStage(currentStageDoc.content)) {
                uniqueTitle = stagesLibDoc.content.compositions.updateTitle(currentStageDoc.streamID, updatedStage.title)
            } else if (isTemplateStage(currentStageDoc.content)) {
                uniqueTitle = stagesLibDoc.content.templates.updateTitle(currentStageDoc.streamID, updatedStage.title)
            } else if (isProposalStage(currentStageDoc.content)) {
                uniqueTitle = stagesLibDoc.content.proposals.updateTitle(currentStageDoc.streamID, updatedStage.title)
            }

            await API.doc.updateStream<CambrianStagesLibType>(auth, stagesLibDoc.streamID, stagesLibDoc.content.data)
        }

        const res = await API.doc.updateStream<T>(auth, currentStageDoc.streamID, updatedStage, { ...currentStageDoc.metadata, tags: [uniqueTitle] })

        if (!res || res.status !== 200) throw new Error('Stage update error: failed to update stage')

        return uniqueTitle
    } catch (e) {
        cpLogger.push(e)
    }
}

