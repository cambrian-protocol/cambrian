import { DocumentModel } from "../../../services/api/cambrian.api";
import { TemplateModel } from "@cambrian/app/models/TemplateModel";
import { UserType } from "@cambrian/app/store/UserContext";

export default class MockTemplateService {

    async create(auth: UserType, template: TemplateModel) {
        return { streamID: 'mock-streamID', title: template.title }
    }

    async save(auth: UserType, templateDoc: DocumentModel<TemplateModel>) {
    }

    async readProposalCommit(streamID: string, commitID: string) {
        return {
            streamID: 'dummy-proposal-streamID',
            commitID: 'dummy-proposal-commitID',
            content: {
                title: 'Dummy Proposal',
                description: '',
                template: {
                    streamID: 'dummy-template-streamID',
                    commitID: 'dummy-template-commitID',
                },
                flexInputs: [],
                author: '0x:proposalAuthor',
                price: {
                    amount:
                        0,
                    tokenAddress:
                        '0x',
                },
                isSubmitted: false,
            }
        }
    }

    async subscribe() { }

    async unsubscribe() { }
}