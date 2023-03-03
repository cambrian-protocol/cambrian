import API, { DocumentModel } from "./api/cambrian.api";

import { GENERAL_ERROR } from "../constants/ErrorMessages";
import { ProposalModel } from "../models/ProposalModel";
import { StageNames } from "../models/StageModel";
import { TemplateModel } from "../models/TemplateModel";
import { UserType } from "../store/UserContext";
import { call } from "../utils/service.utils";
import { cpLogger } from "./api/Logger.api";
import { loadStagesLib } from "../utils/stagesLib.utils";

export default class TemplateService {

    async create(auth: UserType, template: TemplateModel) {
        try {
            if (!auth.session || !auth.did)
                throw GENERAL_ERROR['NO_CERAMIC_CONNECTION']

            const stageMetadata = {
                controllers: [auth.did],
                family: `template`,
                tags: [template.title]
            }

            const stageIds = await API.doc.generateStreamAndCommitId(auth, stageMetadata)

            if (!stageIds) throw GENERAL_ERROR['CERAMIC_LOAD_ERROR']

            const stagesLibDoc = await loadStagesLib(auth)
            const uniqueTitle = stagesLibDoc.content.addStage(stageIds.streamId, template.title, StageNames.template)

            await API.doc.updateStream(auth, stageIds.streamId, { ...template, title: uniqueTitle }, { ...stageMetadata, tags: [uniqueTitle] })
            await API.doc.updateStream(auth, stagesLibDoc.streamID, stagesLibDoc.content)

            return { streamID: stageIds.streamId, title: uniqueTitle }
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
        }
    }

    async save(auth: UserType, templateDoc: DocumentModel<TemplateModel>) {
        try {
            await API.doc.updateStream(auth, templateDoc.streamID, templateDoc.content, { ...templateDoc.metadata, tags: [templateDoc.content.title] })
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
        }
    }

    async readProposalCommit(streamID: string, commitID: string) {
        try {
            const res = await API.doc.readCommit<ProposalModel>(streamID, commitID)
            if (res) return res
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_LOAD_ERROR']
        }
    }

    async requestChange(auth: UserType, proposalStreamID: string) {
        try {
            if (!auth.session || !auth.did)
                throw GENERAL_ERROR['UNAUTHORIZED']

            call('requestChange', 'POST', auth, {
                id: proposalStreamID,
                session: auth.session.serialize(),
            })

        } catch (e) {
            console.error(e)
        }
    }

    // TODO create Trilobot endpoint. Notify Proposal author that proposal has been received and is on review
    async receive(auth: UserType, proposalStreamID: string) {
        try {
            if (!auth.session || !auth.did)
                throw GENERAL_ERROR['UNAUTHORIZED']

            call('receiveProposal', 'POST', auth, {
                id: proposalStreamID,
                session: auth.session.serialize(),
            })

        } catch (e) {
            console.error(e)
        }
    }

    // TODO create Trilobot endpoint. Notify Proposal author that proposal has been declined 
    async decline(auth: UserType, proposalStreamID: string) {
        try {
            if (!auth.session || !auth.did)
                throw GENERAL_ERROR['UNAUTHORIZED']

            call('declineProposal', 'POST', auth, {
                id: proposalStreamID,
                session: auth.session.serialize(),
            })

        } catch (e) {
            console.error(e)
        }
    }

    async approve(auth: UserType, proposalStreamID: string) {
        try {
            if (!auth.session || !auth.did)
                throw GENERAL_ERROR['UNAUTHORIZED']

            call('approveProposal', 'POST', auth, {
                id: proposalStreamID,
                session: auth.session.serialize(),
            })

        } catch (e) {
            console.error(e)
        }
    }

    async subscribe() { }

    async unsubscribe() { }
}