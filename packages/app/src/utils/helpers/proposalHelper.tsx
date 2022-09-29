import {
    ReceivedProposalCommitType,
    ReceivedProposalsHashmapType,
    TemplateModel,
} from '@cambrian/app/models/TemplateModel'
import {
    ceramicInstance,
    loadCommitWorkaround,
} from '@cambrian/app/services/ceramic/CeramicUtils'

import { CAMBRIAN_DID } from 'packages/app/config'
import { GENERAL_ERROR } from '@cambrian/app/constants/ErrorMessages'
import IPFSSolutionsHub from '@cambrian/app/hubs/IPFSSolutionsHub'
import { ProposalInfoType } from '@cambrian/app/components/list/ProposalListItem'
import { ProposalModel } from '@cambrian/app/models/ProposalModel'
import { ProposalStatus } from '@cambrian/app/models/ProposalStatus'
import ProposalsHub from '@cambrian/app/hubs/ProposalsHub'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { StageStackType } from '@cambrian/app/ui/dashboard/ProposalsDashboardUI'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { UserType } from '@cambrian/app/store/UserContext'
import { ethers } from 'ethers'
import { mergeFlexIntoComposition } from '../transformers/Composition'
import { parseComposerSolvers } from '../transformers/ComposerTransformer'
import { SolverConfigModel } from '@cambrian/app/models/SolverConfigModel'

export const getProposalStatus = (
    proposal: ProposalModel,
    approvedStageStack?: StageStackType,
    onChainProposal?: ethers.Contract,
    receivedProposalCommits?: ReceivedProposalCommitType[]
): ProposalStatus => {
    if (onChainProposal) {
        if (onChainProposal.isExecuted) {
            return ProposalStatus.Executed
        } else {
            return ProposalStatus.Funding
        }
    } else if (approvedStageStack) {
        return ProposalStatus.Approved
    } else if (proposal.isCanceled) {
        return ProposalStatus.Canceled
    } else if (receivedProposalCommits) {
        const proposalCommit =
            receivedProposalCommits[receivedProposalCommits.length - 1]

        if (proposalCommit.isDeclined) {
            return ProposalStatus.Canceled
        } else if (proposalCommit.approved) {
            return ProposalStatus.Approved
        } else if (proposalCommit.requestChange) {
            return ProposalStatus.ChangeRequested
        } else {
            return ProposalStatus.OnReview
        }
    } else {
        if (proposal.isSubmitted) {
            return ProposalStatus.OnReview
        } else {
            return ProposalStatus.Draft
        }
    }
}

/**
 * Returns the latest registered proposalCommit from the templateStream
 *
 */
export const getLatestProposalSubmission = (
    proposalStreamID: string,
    receivedProposals: ReceivedProposalsHashmapType
) => {
    const registeredProposal = receivedProposals[proposalStreamID]

    if (registeredProposal) {
        const latestProposalCommit =
            registeredProposal[registeredProposal.length - 1]

        if (latestProposalCommit) {
            return latestProposalCommit
        }
    }
}

export const getOnChainProposal = async (
    currentUser: UserType,
    proposalCommitID: string,
    templateCommitID: string
) => {
    const proposalID = getOnChainProposalId(proposalCommitID, templateCommitID)
    const proposalsHub = new ProposalsHub(
        currentUser.signer,
        currentUser.chainId
    )
    const res = await proposalsHub.getProposal(proposalID)

    if (
        res.id !==
        '0x0000000000000000000000000000000000000000000000000000000000000000'
    ) {
        return res
    }
}

export const getSolutionBaseId = (
    proposalCommitID: string,
    templateCommitID: string
) => {
    return ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
            ['string', 'string'],
            [templateCommitID, proposalCommitID]
        )
    )
}

export const getSolutionSafeBaseId = (
    proposalCommitID: string,
    templateCommitID: string
) => {
    const baseId = getSolutionBaseId(proposalCommitID, templateCommitID)

    let nonce = 1 // Default nonce is 1

    /**
     * TODO
     * To protect against DOS caused by a proposal being created ahead of our real users,
     * a nonce is incremented on-chain.
     *
     * This is where we would fetch the IPFSSolutionsHub.bases[baseId] and check if it's contents are
     * what we expect. If they aren't, we can increment the nonce until we find the Base made by a
     * legitimate user.
     *
     * We can do a similar procedure later when fetching proposals from on-chain.
     *
     */

    return ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
            ['bytes32', 'uint256'],
            [baseId, nonce]
        )
    )
}

export const getOnChainProposalId = (
    proposalCommitID: string,
    templateCommitID: string
) => {
    const solutionSafeBaseId = getSolutionSafeBaseId(
        proposalCommitID,
        templateCommitID
    )
    let nonce = 1
    // TODO Same idea as above. Somebody may have front-ran the proposalId we expected
    // We can fetch a proposal starting at nonce = 1, check if its what we expect..
    // If it's not, increment nonce until it is
    // We're not worrying about this right now

    return ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
            ['bytes32', 'string', 'uint256'],
            [solutionSafeBaseId, proposalCommitID, nonce]
        )
    )
}

export const getApprovedProposalCommitID = (
    template: TemplateModel,
    proposalStreamID: string
) =>
    (template.receivedProposals &&
        template.receivedProposals[proposalStreamID]?.find(
            (commit) => commit.approved
        )?.proposalCommitID) ||
    undefined

export const getParsedSolvers = async (
    stageStack: StageStackType,
    currentUser: UserType
) => {
    const _compositionWithFlexInputs = mergeFlexIntoComposition(
        mergeFlexIntoComposition(
            stageStack.composition,
            stageStack.template.flexInputs
        ),
        stageStack.proposal.flexInputs
    )

    if (stageStack.template.price.isCollateralFlex) {
        _compositionWithFlexInputs.solvers.forEach((solver) => {
            solver.config.collateralToken =
                stageStack.proposal.price.tokenAddress
        })
    }

    const _parsedSolvers = await parseComposerSolvers(
        _compositionWithFlexInputs.solvers,
        currentUser.web3Provider
    )

    return _parsedSolvers
}

export const deployProposal = async (
    currentUser: UserType,
    stageStack: StageStackType
) => {
    // TODO Sanity check function that this is approved
    const parsedSolvers = await getParsedSolvers(stageStack, currentUser)

    if (parsedSolvers) {
        const proposalsHub = new ProposalsHub(
            currentUser.signer,
            currentUser.chainId
        )

        const solutionSafeBaseId = getSolutionSafeBaseId(
            stageStack.proposalCommitID,
            stageStack.proposal.template.commitID
        )

        const transaction = await proposalsHub.createProposal(
            parsedSolvers[0].collateralToken,
            stageStack.proposal.price.amount,
            solutionSafeBaseId,
            parsedSolvers.map((solver) => solver.config),
            stageStack.proposalCommitID
        )
        let rc = await transaction.wait()
        const event = rc.events?.find(
            (event) => event.event === 'CreateProposal'
        )
        if (!event) throw GENERAL_ERROR['FAILED_PROPOSAL_DEPLOYMENT']

        // If for some reason some POS wants to DOS we can save the correct id nonce
        // on ceramic to save time for subsequent loads
    }
}

export const deploySolutionBase = async (
    currentUser: UserType,
    stageStack: StageStackType
) => {
    try {
        const parsedSolvers = await getParsedSolvers(stageStack, currentUser)

        if (parsedSolvers) {
            // Pin solverConfigs separately to have access without metaData from Solution
            const solverConfigsDoc = await createSolverConfigs(
                parsedSolvers,
                stageStack.proposalCommitID,
                currentUser
            )

            if (!solverConfigsDoc) throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']

            const solutionsHub = new IPFSSolutionsHub(
                currentUser.signer,
                currentUser.chainId
            )

            const solutionBaseId: string = getSolutionBaseId(
                stageStack.proposalCommitID,
                stageStack.proposal.template.commitID
            )

            const transaction = await solutionsHub.createBase(
                solutionBaseId,
                parsedSolvers[0].collateralToken.address,
                parsedSolvers.map((solver) => solver.config),
                solverConfigsDoc.commitId.toString()
            )
            let rc = await transaction.wait()
            const event = rc.events?.find(
                (event) => event.event === 'CreateBase'
            )
            if (event) return true
        }
    } catch (e) {
        throw e
    }
}

export const createSolverConfigs = async (
    parsedSolvers: SolverModel[],
    proposalCommitId: string,
    currentUser: UserType
) => {
    try {
        const solverConfigsDoc = await TileDocument.deterministic(
            ceramicInstance(currentUser),
            {
                controllers: [currentUser.did],
                family: `cambrian-solverConfigs`,
                tags: [proposalCommitId],
            },
            { pin: true }
        )

        await solverConfigsDoc.update(
            {
                solverConfigs: parsedSolvers.map((x) => x.config),
            },
            {
                controllers: [currentUser.did],
                family: `cambrian-solverConfigs`,
                tags: [proposalCommitId],
            },
            { pin: true }
        )

        return solverConfigsDoc
    } catch (e) {
        console.error(e)
    }
}

export const fetchProposalInfo = async (
    currentUser: UserType,
    proposalStreamID: string
): Promise<ProposalInfoType> => {
    const cambrianStageStack = (
        await TileDocument.deterministic(ceramicInstance(currentUser), {
            controllers: [CAMBRIAN_DID],
            family: 'cambrian-archive',
            tags: [proposalStreamID],
        })
    ).content as { proposalStack: StageStackType }

    if (cambrianStageStack.proposalStack) {
        // after approved
        const onChainProposal: ethers.Contract | undefined =
            await getOnChainProposal(
                currentUser,
                cambrianStageStack.proposalStack.proposalCommitID,
                cambrianStageStack.proposalStack.proposal.template.commitID
            )
        return {
            title: cambrianStageStack.proposalStack.template.title,
            status: getProposalStatus(
                cambrianStageStack.proposalStack.proposal,
                cambrianStageStack.proposalStack,
                onChainProposal,
                cambrianStageStack.proposalStack.template.receivedProposals[
                    proposalStreamID
                ]
            ),
            template: cambrianStageStack.proposalStack.template,
        }
    } else {
        // before approved
        let proposalDoc = (await ceramicInstance(currentUser).loadStream(
            proposalStreamID
        )) as TileDocument<ProposalModel>

        const templateStreamContent = (
            await ceramicInstance(currentUser).loadStream(
                proposalDoc.content.template.streamID
            )
        ).content as TemplateModel

        // Fallback in case cambrian- stagStack had no entry but there is an approved commit
        const approvedCommitID = getApprovedProposalCommitID(
            templateStreamContent,
            proposalStreamID
        )
        let onChainProposal: ethers.Contract | undefined
        if (approvedCommitID) {
            onChainProposal = await getOnChainProposal(
                currentUser,
                approvedCommitID,
                proposalDoc.content.template.commitID
            )
        }

        // Note: Displaying the latest submitted proposal title for anybody other than the author
        if (
            !proposalDoc.content.isSubmitted &&
            currentUser.did !== proposalDoc.content.author
        ) {
            const latestProposalSubmission = getLatestProposalSubmission(
                proposalStreamID,
                templateStreamContent.receivedProposals
            )
            if (latestProposalSubmission) {
                proposalDoc = await loadCommitWorkaround<ProposalModel>(
                    currentUser,
                    latestProposalSubmission.proposalCommitID
                )
            }
        }
        const templateCommitContent = (
            await loadCommitWorkaround<TemplateModel>(
                currentUser,
                proposalDoc.content.template.commitID
            )
        ).content

        return {
            title: proposalDoc.content.title,
            status: getProposalStatus(
                proposalDoc.content,
                undefined,
                onChainProposal,
                templateStreamContent.receivedProposals[proposalStreamID]
            ),
            template: templateCommitContent,
        }
    }
}
