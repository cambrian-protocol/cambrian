import API, { DocumentModel } from "./api/cambrian.api";

import { ProposalModel } from "../models/ProposalModel";
import { TemplateModel } from "../models/TemplateModel";
import { UserType } from "../store/UserContext";

export default class TemplateService {

    async saveTemplate(auth: UserType, templateDoc: DocumentModel<TemplateModel>) {
        try {
            await API.doc.updateStream(auth, templateDoc.streamID, templateDoc.content)
        } catch (e) {
            console.error(e)
        }
    }

    async readProposalCommit(streamID: string, commitID: string) {
        try {
            const res = await API.doc.readCommit<ProposalModel>(streamID, commitID)
            if (res) return res
        } catch (e) {
            console.error(e)
        }
    }

    async subscribe() { }

    async unsubscribe() { }
}