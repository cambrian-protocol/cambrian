import { DocumentModel } from "../../../services/api/cambrian.api";
import { ProposalModel } from "@cambrian/app/models/ProposalModel";
import { UserType } from "@cambrian/app/store/UserContext";

export default class MockProposalService {

    async create(auth: UserType, proposal: ProposalModel) {
        return { streamID: 'mock-streamID', title: proposal.title }
    }

    async save(auth: UserType, proposalDoc: DocumentModel<ProposalModel>) {
    }

    async subscribe() { }

    async unsubscribe() { }
}