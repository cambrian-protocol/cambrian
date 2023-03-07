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

        const stageMetadata = {
            controllers: [auth.did],
            family: `template`,
            tags: [stage.title]
        }

        const stageIds = await API.doc.generateStreamAndCommitId(auth, stageMetadata)
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

        const res = await API.doc.create<T>(auth, { ...stage, title: uniqueTitle }, { ...stageMetadata, tags: [uniqueTitle] })
        if (!res) throw new Error('Failed to create Stage')

        const updateRes = await API.doc.updateStream<CambrianStagesLibType>(auth, stagesLibDoc.streamID, stagesLibDoc.content.data)

        if (updateRes?.status === 200) {
            return { streamID: res.streamID, title: uniqueTitle }
        }


    } catch (e) {
        cpLogger.push(e)
        throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
    }

}

export const updateStage = async <T extends StageModel>(
    auth: UserType,
    currentStage: DocumentModel<T>,
    updatedStage: T,
): Promise<string | undefined> => {
    try {
        let uniqueTitle = updatedStage.title
        if (currentStage.content.title !== updatedStage.title) {
            const stagesLibDoc = await loadStagesLib(auth)
            if (isCompositionStage(currentStage.content)) {
                uniqueTitle = stagesLibDoc.content.compositions.updateTitle(currentStage.streamID, updatedStage.title)
            } else if (isTemplateStage(currentStage.content)) {
                uniqueTitle = stagesLibDoc.content.templates.updateTitle(currentStage.streamID, updatedStage.title)
            } else if (isProposalStage(currentStage.content)) {
                uniqueTitle = stagesLibDoc.content.proposals.updateTitle(currentStage.streamID, updatedStage.title)
            }

            await API.doc.updateStream<CambrianStagesLibType>(auth, stagesLibDoc.streamID, stagesLibDoc.content.data)
        }

        const res = await API.doc.updateStream<T>(auth, currentStage.streamID, updatedStage)

        if (res?.status === 200) {
            return uniqueTitle
        }
    } catch (e) {
        cpLogger.push(e)
    }
}

