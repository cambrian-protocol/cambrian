import { DocumentModel } from "../../../services/api/cambrian.api";
import { ProposalModel } from "@cambrian/app/models/ProposalModel";
import { TemplateModel } from "@cambrian/app/models/TemplateModel";
import { UserType } from "@cambrian/app/store/UserContext";

export default class MockProposalService {

    async create(auth: UserType, templateDoc: DocumentModel<TemplateModel>) {
        return { streamID: 'mock-streamID', title: "Proposal" }
    }

    async save(auth: UserType, proposalDoc: DocumentModel<ProposalModel>) { }

    async submit(auth: UserType, proposalStreamID: string) { }

    async cancel(auth: UserType, proposalStreamID: string) { }

    async archive(auth: UserType, proposalStreamID: string) { }

    async fetchToken(tokenAddress: string, auth?: UserType,) {
        return {
            chainId: 31337,
            address: "0xc778417e063141139fce010982780140aa0cd5ab",
            symbol: '??',
            decimals: 18,
            name: '??'
        }
    }

    async subscribe() { }

    async unsubscribe() { }
}