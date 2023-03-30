import API, { DocumentModel } from "../api/cambrian.api";
import { BASE_SOLVER_IFACE, ERC20_IFACE, IPFS_SOLUTIONS_HUB_IFACE, PROPOSALS_HUB_IFACE } from "packages/app/config/ContractInterfaces";
import { BigNumber, ethers } from "ethers";
import Proposal, { IStageStack } from "@cambrian/app/classes/stages/Proposal";
import { getOnChainProposalId, getSolutionBaseId, getSolutionSafeBaseId } from "@cambrian/app/utils/proposal.utils";
import { getSolverConfig, getSolverData, getSolverMetadata, getSolverOutcomes } from '@cambrian/app/components/solver/SolverGetters';

import { CompositionModel } from "@cambrian/app/models/CompositionModel";
import { GENERAL_ERROR } from "../../constants/ErrorMessages";
import IPFSSolutionsHub from "@cambrian/app/hubs/IPFSSolutionsHub";
import { ProposalConfig } from './../../classes/stages/Proposal';
import { ProposalModel } from "../../models/ProposalModel";
import ProposalsHub from "@cambrian/app/hubs/ProposalsHub";
import { SUPPORTED_CHAINS } from "packages/app/config/SupportedChains";
import { SolverModel } from "@cambrian/app/models/SolverModel";
import { TemplateModel } from "@cambrian/app/models/TemplateModel";
import { TokenAPI } from "../api/Token.api";
import { TokenModel } from "@cambrian/app/models/TokenModel";
import { UserType } from "../../store/UserContext";
import { call } from "../../utils/service.utils";
import { cpLogger } from "../api/Logger.api";
import { createStage } from "@cambrian/app/utils/stage.utils";
import { getParsedSolvers } from "@cambrian/app/utils/solver.utils";
import { getSolverMethods } from '@cambrian/app/utils/helpers/solverHelpers';
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

    async subscribe() { }

    async unsubscribe() { }

    async fetchToken(tokenAddress: string, auth?: UserType | null) {
        return await TokenAPI.getTokenInfo(tokenAddress, auth?.web3Provider, auth?.chainId)
    }

    async fetchProposalTokenInfos(
        collateralTokenAddress: string,
        denominationTokenAddress: string,
        auth?: UserType | null
    ): Promise<{
        collateralToken: TokenModel
        denominationToken: TokenModel
    }> {
        const collateralToken = await this.fetchToken(
            collateralTokenAddress,
            auth,
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

    async fetchOnChainProposal(latestCommitDoc?: DocumentModel<ProposalModel>, auth?: UserType | null) {
        try {
            if (latestCommitDoc && auth) {
                const proposalID = getOnChainProposalId(
                    latestCommitDoc.commitID,
                    latestCommitDoc.content.template.commitID
                )
                // TODO default chain when user not connected
                const proposalsHub = new ProposalsHub(
                    auth.signer,
                    auth.chainId
                )
                const onChainProposal = await proposalsHub.getProposal(proposalID)
                if (onChainProposal.id !== ethers.constants.HashZero) return onChainProposal
            }
        } catch (e) {
        }
    }

    async fetchProposalConfig(_proposalDoc: DocumentModel<ProposalModel>, auth?: UserType | null): Promise<ProposalConfig | undefined> {
        try {
            const stageStack =
                await this.fetchStageStack(_proposalDoc)

            if (!stageStack)
                throw new Error('Error while fetching stage stack')

            const onChainProposal = await this.fetchOnChainProposal(stageStack.proposalDocs.latestCommitDoc, auth)

            const tokens =
                await this.fetchProposalTokenInfos(
                    _proposalDoc.content.price.tokenAddress,
                    stageStack.templateDocs.commitDoc.content.price
                        .denominationTokenAddress,
                    auth
                )

            return {
                ...stageStack,
                onChainProposal: onChainProposal,
                tokens: {
                    denomination: tokens.denominationToken,
                    collateral: tokens.collateralToken,
                },
            }
        } catch (e) {
            console.error(e)
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

    async fetchAllSolvers(auth: UserType, proposal: Proposal) {
        const ipfsSolutionsHubContract = new ethers.Contract(
            SUPPORTED_CHAINS[auth.chainId].contracts.ipfsSolutionsHub,
            IPFS_SOLUTIONS_HUB_IFACE,
            auth.signer
        )

        const solverAddresses: string[] = await ipfsSolutionsHubContract.getSolvers(
            proposal.onChainProposal.solutionId
        )

        if (solverAddresses && solverAddresses.length > 0) {
            const solvers = await Promise.all(
                solverAddresses.map(async (solverAddress) => {
                    const solverContract = new ethers.Contract(
                        solverAddress,
                        BASE_SOLVER_IFACE,
                        auth?.signer
                    )
                    const solverMethods = getSolverMethods(
                        solverContract.interface,
                        async (method: string, ...args: any[]) =>
                            await solverContract[method](...args)
                    )
                    const fetchedMetadata = await getSolverMetadata(
                        solverContract,
                        auth.web3Provider
                    )

                    const fetchedSolverConfig = await getSolverConfig(
                        solverContract
                    )
                    const fetchedOutcomes = await getSolverOutcomes(
                        fetchedSolverConfig
                    )

                    const solverData = await getSolverData(
                        solverContract,
                        solverMethods,
                        auth,
                        fetchedOutcomes,
                        fetchedMetadata,
                        fetchedSolverConfig
                    )

                    return {
                        address: solverAddress,
                        data: solverData,
                    }
                })
            )
            return solvers
        }
    }

    async createSolutionBase(
        auth: UserType,
        proposal: Proposal,
    ) {
        try {
            const parsedSolvers = await getParsedSolvers(proposal, auth)

            if (!parsedSolvers || !proposal.latestCommitDoc) {
                throw new Error('Invalid solvers or no registered Proposal Commit')
            }

            // Save solverConfigs separately to have access without metaData from Solution
            const solverConfigsDoc = await this.saveSolverConfig(
                parsedSolvers,
                proposal.latestCommitDoc.commitID,
                auth
            )

            if (!solverConfigsDoc) throw new Error('Failed to save solver configs')

            const solutionsHub = new IPFSSolutionsHub(
                auth.signer,
                auth.chainId
            )

            const solutionBaseId: string = getSolutionBaseId(
                proposal.latestCommitDoc.commitID,
                proposal.latestCommitDoc.content.template.commitID
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

            if (!event) {
                throw new Error('Failed to create SolutionBase')
            }

        } catch (e) {
            throw e
        }
    }

    async createOnChainProposal(auth: UserType, proposal: Proposal) {
        try {
            // TODO Sanity check function that this is approved
            const parsedSolvers = await getParsedSolvers(proposal, auth)
            if (!parsedSolvers || !proposal.latestCommitDoc) {
                throw new Error('Invalid solvers or no registered Proposal Commit')
            }

            const amount = typeof proposal.content.price.amount === 'number' ? proposal.content.price.amount : 0
            const solutionSafeBaseId = getSolutionSafeBaseId(
                proposal.latestCommitDoc.commitID,
                proposal.latestCommitDoc.content.template.commitID
            )

            const proposalsHub = new ProposalsHub(
                auth.signer,
                auth.chainId
            )

            // TODO: If for some reason some POS wants to DOS we can save the correct id nonce
            // on ceramic to save time for subsequent loads

            const transaction = await proposalsHub.createProposal(
                parsedSolvers[0].collateralToken,
                amount,
                solutionSafeBaseId,
                parsedSolvers.map((solver) => solver.config),
                proposal.doc.commitID
            )

            const receipt = await transaction.wait()
            const event = receipt.events?.find(
                (event) => event.event === 'CreateProposal'
            )
            if (!event || !event.args || event.args.length < 1) {
                throw new Error('Failed to create Proposal')
            }

            const proposalId = event.args[0]
            const onChainProposal = await proposalsHub.getProposal(proposalId)

            if (!onChainProposal || onChainProposal.id === ethers.constants.HashZero) {
                throw new Error('Failed to find on-chain Proposal')
            }

            return onChainProposal
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
            const solverConfigIDs = await API.doc.deterministic({
                controllers: [auth.did],
                family: SOLVER_CONFIGS_FAMILY,
                tags: [proposalCommitId],
            })
            if (!solverConfigIDs) throw new Error('Deterministic Error: Failed to generate Stream and Commit Id for SolverConfigs')

            const res = await API.doc.updateStream(auth, solverConfigIDs.streamID, { solverConfigs: solverConfigs })
            if (!res) throw new Error('Update Stream Error: Failed to update SolverConfigs Stream')

            return {
                ...solverConfigIDs,
                commitID: res.commitID,
                content: { solverConfigs: solverConfigs }
            }
        } catch (e) {
            console.error(e)
        }
    }

    async approve(auth: UserType, amount: number, token: TokenModel) {
        try {
            const weiAmount = ethers.utils.parseUnits(
                amount.toString(),
                token.decimals
            )

            const erc20Contract = new ethers.Contract(
                token.address,
                ERC20_IFACE,
                auth.signer
            )

            const balance = await erc20Contract.balanceOf(
                await auth.signer.getAddress()
            )

            if (BigNumber.from(balance).lt(weiAmount))
                throw GENERAL_ERROR['INSUFFICIENT_FUNDS']

            await erc20Contract.approve(
                SUPPORTED_CHAINS[auth.chainId].contracts.proposalsHub, weiAmount
            )
        } catch (e) {
            throw e
        }
    }

    async fund(auth: UserType, proposalId: string, amount: number, token: TokenModel) {
        try {
            const weiAmount = ethers.utils.parseUnits(
                amount.toString(),
                token.decimals
            )

            const proposalsHubContract = new ethers.Contract(
                SUPPORTED_CHAINS[auth.chainId].contracts.proposalsHub,
                PROPOSALS_HUB_IFACE,
                auth.signer
            )

            await proposalsHubContract.fundProposal(proposalId, token.address, weiAmount)

        } catch (e) { throw e }
    }

    async defund(auth: UserType, proposalId: string, amount: number, token: TokenModel) {
        try {
            const weiAmount = ethers.utils.parseUnits(
                amount.toString(),
                token.decimals
            )

            const proposalsHubContract = new ethers.Contract(
                SUPPORTED_CHAINS[auth.chainId].contracts.proposalsHub,
                PROPOSALS_HUB_IFACE,
                auth.signer
            )

            await proposalsHubContract.defundProposal(proposalId, token.address, weiAmount)
        } catch (e) { throw e }
    }

    async execute(auth: UserType, proposal: Proposal) {
        try {
            const parsedSolvers = await getParsedSolvers(proposal, auth)

            if (!parsedSolvers) throw new Error('Failed to parse Solvers')

            const proposalsHub = new ProposalsHub(
                auth.signer,
                auth.chainId
            )

            await proposalsHub.executeProposal(
                proposal.onChainProposal.id,
                parsedSolvers.map((solver) => solver.config)
            )
        } catch (e) {
            throw e
        }
    }
}