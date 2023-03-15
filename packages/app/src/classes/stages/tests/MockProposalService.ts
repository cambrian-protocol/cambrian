import Proposal, { IStageStack } from "../Proposal";

import { DocumentModel } from "../../../services/api/cambrian.api";
import { ProposalModel } from "@cambrian/app/models/ProposalModel";
import { SolverModel } from "@cambrian/app/models/SolverModel";
import { TemplateModel } from "@cambrian/app/models/TemplateModel";
import { TokenModel } from "@cambrian/app/models/TokenModel";
import { UserType } from "@cambrian/app/store/UserContext";

export default class MockProposalService {

    async createStage(auth: UserType, templateDoc: DocumentModel<TemplateModel>) {
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

    async create(auth: UserType, proposal: Proposal) { }

    async fetchStageStack(
        _proposalDoc: DocumentModel<ProposalModel>
    ): Promise<IStageStack | undefined> { return undefined }

    async fetchLatestProposalCommitDoc(
        templateStreamDoc: DocumentModel<TemplateModel>,
        proposalStreamID: string
    ): Promise<DocumentModel<ProposalModel> | undefined> { return undefined }

    async fetchSolutionBase(auth: UserType, proposalCommitID: string, templateCommitID: string) {
        return undefined
    }

    async createSolutionBase(
        auth: UserType,
        proposal: Proposal,
    ) {
        return true
    }

    async saveSolverConfig(
        parsedSolvers: SolverModel[],
        proposalCommitId: string,
        auth: UserType
    ) {
        return {
            streamID: '',
            commitID: '',
            content: { solverConfigs: [] }
        }
    }

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