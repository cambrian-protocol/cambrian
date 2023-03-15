import API, { DocumentModel } from "../api/cambrian.api";
import Proposal, { IStageStack } from "@cambrian/app/classes/stages/Proposal";
import { getParsedSolvers, getSolutionBaseId, getSolutionSafeBaseId } from "@cambrian/app/utils/proposal.utils";

import { CompositionModel } from "@cambrian/app/models/CompositionModel";
import { GENERAL_ERROR } from "../../constants/ErrorMessages";
import IPFSSolutionsHub from "@cambrian/app/hubs/IPFSSolutionsHub";
import { ProposalModel } from "../../models/ProposalModel";
import ProposalsHub from "@cambrian/app/hubs/ProposalsHub";
import { SolverModel } from "@cambrian/app/models/SolverModel";
import { TemplateModel } from "@cambrian/app/models/TemplateModel";
import { TokenAPI } from "../api/Token.api";
import { TokenModel } from "@cambrian/app/models/TokenModel";
import { UserType } from "../../store/UserContext";
import { call } from "../../utils/service.utils";
import { cpLogger } from "../api/Logger.api";
import { createStage } from "@cambrian/app/utils/stage.utils";
import { ethers } from "ethers";
import { loadStagesLib } from "../../utils/stagesLib.utils";
import randimals from 'randimals'

export const SOLVER_CONFIGS_FAMILY = `cambrian-solverConfigs` // TODO Centralize families

export default class ProposalService {

    async createStage(auth: UserType, templateDoc: DocumentModel<TemplateModel>) {
        try {
            if (!auth.session || !auth.did)
                throw GENERAL_ERROR['NO_CERAMIC_CONNECTION']


            const proposal: ProposalModel = {
                title: randimals(),
                description: '',
                template: {
                    streamID: templateDoc.streamID,
                    commitID: templateDoc.commitID,
                },
                flexInputs: templateDoc.content.flexInputs.filter(
                    (flexInput) =>
                        flexInput.tagId !== 'collateralToken' &&
                        flexInput.value === ''
                ),
                author: auth.did,
                price: {
                    amount:
                        templateDoc.content.price.amount !== ''
                            ? templateDoc.content.price.amount
                            : 0,
                    tokenAddress:
                        templateDoc.content.price
                            .denominationTokenAddress,
                },
                isSubmitted: false,
            }

            return await createStage(auth, proposal)
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
        }
    }

    async update(auth: UserType, currentProposalDoc: DocumentModel<ProposalModel>, updatedProposal: ProposalModel) {
        try {
            await API.doc.updateStream(auth,
                currentProposalDoc.streamID,
                updatedProposal,
                { ...currentProposalDoc.metadata, tags: [updatedProposal.title] }
            )
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
        }
    }

    async submit(auth: UserType, proposalStreamID: string) {
        try {
            if (!auth.session || !auth.did)
                throw GENERAL_ERROR['UNAUTHORIZED']

            return call('proposeDraft', 'POST', auth, {
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

    async create(auth: UserType, proposal: Proposal) {
        try {
            // TODO Sanity check function that this is approved
            const parsedSolvers = await getParsedSolvers(proposal, auth)
            if (!parsedSolvers) {
                return
            }

            const proposalsHub = new ProposalsHub(
                auth.signer,
                auth.chainId
            )

            const solutionSafeBaseId = getSolutionSafeBaseId(
                proposal.doc.commitID,
                proposal.content.template.commitID
            )

            const amount = typeof proposal.content.price.amount === 'number' ? proposal.content.price.amount : 0

            const transaction = await proposalsHub.createProposal(
                parsedSolvers[0].collateralToken,
                amount,
                solutionSafeBaseId,
                parsedSolvers.map((solver) => solver.config),
                proposal.doc.commitID
            )

            const rc = await transaction.wait()
            const event = rc.events?.find(
                (event) => event.event === 'CreateProposal'
            )

            if (!event) throw GENERAL_ERROR['FAILED_PROPOSAL_DEPLOYMENT']
            // If for some reason some POS wants to DOS we can save the correct id nonce
            // on ceramic to save time for subsequent loads
        } catch (e) {
            console.error(e)
        }
    }

    async subscribe() { }

    async unsubscribe() { }

    async fetchToken(tokenAddress: string, auth?: UserType,) {
        try {
            return await TokenAPI.getTokenInfo(tokenAddress, auth?.provider, auth?.chainId)
        } catch (e) {
            console.error(e)
        }
    }

    async fetchProposalTokenInfos(
        collateralTokenAddress: string,
        denominationTokenAddress: string,
        auth?: UserType | null
    ): Promise<{
        collateralToken: TokenModel
        denominationToken: TokenModel
    }> {
        const collateralToken = await TokenAPI.getTokenInfo(
            collateralTokenAddress,
            auth?.web3Provider,
            auth?.chainId
        )
        const denominationToken =
            denominationTokenAddress === collateralTokenAddress
                ? collateralToken
                : await TokenAPI.getTokenInfo(
                    denominationTokenAddress,
                    auth?.web3Provider,
                    auth?.chainId
                )

        return {
            collateralToken: collateralToken,
            denominationToken: denominationToken,
        }
    }

    async fetchStageStack(
        _proposalDoc: DocumentModel<ProposalModel>
    ): Promise<IStageStack | undefined> {
        try {
            const templateStreamDoc =
                await API.doc.readStream<TemplateModel>(
                    _proposalDoc.content.template.streamID
                )
            if (!templateStreamDoc)
                throw new Error(
                    'Read Stream Error: Failed to load Template'
                )

            const latestProposalCommitDoc =
                await this.fetchLatestProposalCommitDoc(
                    templateStreamDoc,
                    _proposalDoc.streamID
                )

            const templateCommitDoc =
                await API.doc.readStream<TemplateModel>(
                    _proposalDoc.content.template.commitID
                )
            if (!templateCommitDoc)
                throw new Error(
                    'Read Commit Error: Failed to load Template'
                )

            const compositionDoc =
                await API.doc.readCommit<CompositionModel>(
                    templateStreamDoc.content.composition.streamID,
                    templateStreamDoc.content.composition.commitID
                )
            if (!compositionDoc)
                throw new Error(
                    'Read Commit Error: Failed to load Composition'
                )

            return {
                templateDocs: {
                    streamDoc: templateStreamDoc,
                    commitDoc: templateCommitDoc,
                },
                proposalDocs: {
                    streamDoc: _proposalDoc,
                    latestCommitDoc: latestProposalCommitDoc,
                },
                compositionDoc: compositionDoc,
            }
        } catch (e) {
            console.error(e)
        }
    }

    async fetchLatestProposalCommitDoc(
        templateStreamDoc: DocumentModel<TemplateModel>,
        proposalStreamID: string
    ): Promise<DocumentModel<ProposalModel> | undefined> {
        const allProposalCommits =
            templateStreamDoc.content.receivedProposals[proposalStreamID]
        if (allProposalCommits && allProposalCommits.length > 0) {
            const latestProposalCommit = allProposalCommits.slice(-1)[0]
            return await API.doc.readCommit<ProposalModel>(
                proposalStreamID,
                latestProposalCommit.proposalCommitID
            )
        }
    }

    async fetchSolutionBase(auth: UserType, proposalCommitID: string, templateCommitID: string) {
        try {
            const baseId = getSolutionSafeBaseId(
                proposalCommitID,
                templateCommitID
            )

            const solutionsHub = new IPFSSolutionsHub(
                auth.signer,
                auth.chainId
            )

            const solution = await solutionsHub.contract.bases(baseId)

            if (solution?.id !== ethers.constants.HashZero) {
                return solution
            }

        } catch (e) {
            console.error(e)
        }
    }

    async createSolutionBase(
        auth: UserType,
        proposal: Proposal,
    ) {
        try {
            const parsedSolvers = await getParsedSolvers(proposal, auth)

            if (!parsedSolvers || !proposal.latestCommitDoc) {
                return
            }

            // Save solverConfigs separately to have access without metaData from Solution
            const solverConfigsDoc = await this.saveSolverConfig(
                parsedSolvers,
                proposal.latestCommitDoc?.commitID,
                auth
            )

            if (!solverConfigsDoc) throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']

            const solutionsHub = new IPFSSolutionsHub(
                auth.signer,
                auth.chainId
            )

            const solutionBaseId: string = getSolutionBaseId(
                proposal.latestCommitDoc.commitID,
                proposal.templateCommitDoc.commitID
            )

            const transaction = await solutionsHub.createBase(
                solutionBaseId,
                parsedSolvers[0].collateralToken.address,
                parsedSolvers.map((solver) => solver.config),
                solverConfigsDoc.commitID.toString()
            )

            const rc = await transaction.wait()

            const event = rc.events?.find(
                (event) => event.event === 'CreateBase'
            )

            return Boolean(event)
        } catch (e) {
            throw e
        }
    }

    async saveSolverConfig(
        parsedSolvers: SolverModel[],
        proposalCommitId: string,
        auth: UserType
    ) {
        try {
            if (!auth.session || !auth.did)
                throw GENERAL_ERROR['UNAUTHORIZED']

            const solverConfigs = parsedSolvers.map((solver) => solver.config)
            const solverConfigDocs = await API.doc.create(
                auth,
                { solverConfigs: solverConfigs },
                {
                    controllers: [auth.did],
                    family: SOLVER_CONFIGS_FAMILY,
                    tags: [proposalCommitId],
                }
            )

            return solverConfigDocs
        } catch (e) {
            console.error(e)
        }
    }

}