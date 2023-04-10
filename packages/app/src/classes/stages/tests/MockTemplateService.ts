import { DocumentModel } from "../../../services/api/cambrian.api";
import { TemplateConfig } from "../Template";
import { TemplateModel } from "@cambrian/app/models/TemplateModel";
import { UserType } from "@cambrian/app/store/UserContext";

export default class MockTemplateService {

    async create(auth: UserType, compositionStreamID: string, templateTitle: string) {
        return { streamID: 'mock-streamID', title: templateTitle }
    }

    async update(auth: UserType, currentTemplateDoc: DocumentModel<TemplateModel>, updatedTemplate: TemplateModel) {
        return updatedTemplate.title
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

    async requestChange(auth: UserType, proposalStreamID: string) { }

    async receive(auth: UserType, proposalStreamID: string) { }

    async decline(auth: UserType, proposalStreamID: string) { }

    async approve(auth: UserType, proposalStreamID: string) { }

    async archive(auth: UserType, templateStreamID: string) { }

    async archiveReceivedProposal(auth: UserType, proposalStreamID: string) { }

    async fetchTemplateConfig(templateDoc: DocumentModel<TemplateModel>, auth?: UserType): Promise<TemplateConfig | undefined> { return undefined }

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