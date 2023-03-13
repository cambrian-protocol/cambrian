import { DocumentModel } from "../../../services/api/cambrian.api";
import { IStageStack } from "../Proposal";
import { ProposalModel } from "@cambrian/app/models/ProposalModel";
import { TemplateModel } from "@cambrian/app/models/TemplateModel";
import { TokenModel } from "@cambrian/app/models/TokenModel";
import { UserType } from "@cambrian/app/store/UserContext";

export default class MockProposalService {

    async create(auth: UserType, templateDoc: DocumentModel<TemplateModel>) {
        return { streamID: 'mock-streamID', title: "Proposal" }
    }

    async update(auth: UserType, currentProposalDoc: DocumentModel<ProposalModel>, updatedProposal: ProposalModel) { }

    async submit(auth: UserType, proposalStreamID: string): Promise<Response | undefined> {
        return { status: 200 } as Response
    }

    async cancel(auth: UserType, proposalStreamID: string) { }

    async archive(auth: UserType, proposalStreamID: string) { }

    async fetchProposalTokenInfos(
        collateralTokenAddress: string,
        denominationTokenAddress: string,
        auth?: UserType | null
    ): Promise<{
        collateralToken: TokenModel
        denominationToken: TokenModel
    }> {
        return {
            collateralToken: {
                chainId: 31337,
                address: "0xc778417e063141139fce010982780140aa0cd5ab",
                symbol: '??',
                decimals: 18,
                name: '??'
            }, denominationToken: {
                chainId: 31337,
                address: "0xc778417e063141139fce010982780140aa0cd5ab",
                symbol: '??',
                decimals: 18,
                name: '??'
            }
        }
    }

    async fetchStageStack(
        _proposalDoc: DocumentModel<ProposalModel>
    ): Promise<IStageStack | undefined> { return undefined }

    async fetchLatestProposalCommitDoc(
        templateStreamDoc: DocumentModel<TemplateModel>,
        proposalStreamID: string
    ): Promise<DocumentModel<ProposalModel> | undefined> { return undefined }

    async subscribe() { }

    async unsubscribe() { }
}