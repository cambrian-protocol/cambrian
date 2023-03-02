import API, { DocumentModel } from "./api/cambrian.api";

import { ProposalModel } from "../models/ProposalModel";
import { TemplateModel } from "../models/TemplateModel";
import { UserType } from "../store/UserContext";

export default class ProposalService {

    async saveProposal(auth: UserType, proposalDoc: DocumentModel<ProposalModel>) {
        await API.doc.updateStream(auth, proposalDoc.streamID, proposalDoc.content)
    }

    async saveTemplate(auth: UserType, templateDoc: DocumentModel<TemplateModel>) {
        await API.doc.updateStream(auth, templateDoc.streamID, templateDoc.content)
    }

    async createProposal(auth: UserType, proposal: ProposalModel) {
        if (!auth.did) {
            console.error('Unauthorized!')
            return
        }

        //TODO Tags ??
        await API.doc.create(auth, proposal, { controllers: [auth.did], family: 'proposal' })
    }

    async subscribe() { }

    async unsubscribe() { }
}