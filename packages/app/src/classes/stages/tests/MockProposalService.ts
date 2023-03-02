import { DocumentModel } from "../../../services/api/cambrian.api";
import { ProposalModel } from "@cambrian/app/models/ProposalModel";
import { TemplateModel } from "@cambrian/app/models/TemplateModel";
import { UserType } from "@cambrian/app/store/UserContext";

export default class MockProposalService {

    async saveProposal(auth: UserType, proposalDoc: DocumentModel<ProposalModel>) {
    }

    async saveTemplate(auth: UserType, templateDoc: DocumentModel<TemplateModel>) {
    }

    async subscribe() { }

    async unsubscribe() { }
}