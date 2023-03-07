import API, { DocumentModel } from "../api/cambrian.api";

import { GENERAL_ERROR } from "../../constants/ErrorMessages";
import { ProposalModel } from "../../models/ProposalModel";
import { StageNames } from "../../models/StageModel";
import { UserType } from "../../store/UserContext";
import { call } from "../../utils/service.utils";
import { cpLogger } from "../api/Logger.api";
import { loadStagesLib } from "../../utils/stagesLib.utils";

export default class ProposalService {

    async create(auth: UserType, proposal: ProposalModel) {
        try {
            if (!auth.session || !auth.did)
                throw GENERAL_ERROR['NO_CERAMIC_CONNECTION']

            const stageMetadata = {
                controllers: [auth.did],
                family: `proposal`,
                tags: [proposal.title]
            }

            const stageIds = await API.doc.generateStreamAndCommitId(auth, stageMetadata)

            if (!stageIds) throw GENERAL_ERROR['CERAMIC_LOAD_ERROR']

            const stagesLibDoc = await loadStagesLib(auth)
            const uniqueTitle = stagesLibDoc.content.addStage(stageIds.streamID, proposal.title, StageNames.proposal)

            await API.doc.updateStream(auth, stageIds.streamID, { ...proposal, title: uniqueTitle }, { ...stageMetadata, tags: [uniqueTitle] })
            await API.doc.updateStream(auth, stagesLibDoc.streamID, stagesLibDoc.content)

            return { streamID: stageIds.streamID, title: uniqueTitle }
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
        }
    }

    async save(auth: UserType, proposalDoc: DocumentModel<ProposalModel>) {
        try {
            await API.doc.updateStream(auth, proposalDoc.streamID, proposalDoc.content, { ...proposalDoc.metadata, tags: [proposalDoc.content.title] })
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
        }
    }

    async submit(auth: UserType, proposalStreamID: string) {
        try {
            if (!auth.session || !auth.did)
                throw GENERAL_ERROR['UNAUTHORIZED']

            call('proposeDraft', 'POST', auth, {
                id: proposalStreamID,
                session: auth.session.serialize(),
            })

        } catch (e) {
            console.error(e)
        }
    }

    // TODO create Trilobot endpoint to notify Templater that a Proposal has been cancelled
    async cancel(auth: UserType, proposalStreamID: string) {
        try {
            if (!auth.session || !auth.did)
                throw GENERAL_ERROR['UNAUTHORIZED']

            call('cancelProposal', 'POST', auth, {
                id: proposalStreamID,
                session: auth.session.serialize(),
            })

        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['TRILOBOT_ERROR']
        }
    }

    async archive(auth: UserType, proposalStreamID: string) {
        try {
            const stagesLibDoc = await loadStagesLib(auth)
            stagesLibDoc.content.proposals.archiveStage(proposalStreamID)
            await API.doc.updateStream(auth, stagesLibDoc.streamID, stagesLibDoc.content.data)
        } catch (e) {
            console.error(e)
        }
    }

    async subscribe() { }

    async unsubscribe() { }
}