import {
    CeramicTemplateModel,
    ReceivedProposalCommitType,
    ReceivedProposalsHashmapType,
} from '@cambrian/app/models/TemplateModel'

import { CeramicProposalModel } from '@cambrian/app/models/ProposalModel'
import CeramicStagehand from '@cambrian/app/classes/CeramicStagehand'
import { GENERAL_ERROR } from '@cambrian/app/constants/ErrorMessages'
import IPFSSolutionsHub from '@cambrian/app/hubs/IPFSSolutionsHub'
import { ProposalStackType } from '@cambrian/app/store/ProposalContext'
import { ProposalStatus } from '@cambrian/app/models/ProposalStatus'
import ProposalsHub from '@cambrian/app/hubs/ProposalsHub'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { UserType } from '@cambrian/app/store/UserContext'
import { ethers } from 'ethers'
import { mergeFlexIntoComposition } from '../transformers/Composition'
import { parseComposerSolvers } from '../transformers/ComposerTransformer'

export const getProposalStatus = (
    proposalDoc: TileDocument<CeramicProposalModel>,
    receivedProposalCommits?: ReceivedProposalCommitType[],
    onChainProposal?: ethers.Contract
): ProposalStatus => {
    if (receivedProposalCommits) {
        if (
            receivedProposalCommits[receivedProposalCommits.length - 1]
                .proposalCommitID === proposalDoc.commitId.toString()
        ) {
            const proposalCommit =
                receivedProposalCommits[receivedProposalCommits.length - 1]
            if (proposalCommit.approved) {
                if (onChainProposal) {
                    if (onChainProposal.isExecuted) {
                        return ProposalStatus.Executed
                    } else {
                        return ProposalStatus.Funding
                    }
                } else {
                    return ProposalStatus.Approved
                }
            } else if (proposalCommit.requestChange) {
                return ProposalStatus.ChangeRequested
            } else {
                return ProposalStatus.OnReview
            }
        } else {
            if (proposalDoc.content.isSubmitted) {
                return ProposalStatus.OnReview
            } else {
                return ProposalStatus.ChangeRequested
            }
        }
    } else {
        if (proposalDoc.content.isSubmitted) {
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
    template: CeramicTemplateModel,
    proposalStreamID: string
) =>
    (template.receivedProposals &&
        template.receivedProposals[proposalStreamID]?.find(
            (commit) => commit.approved
        )?.proposalCommitID) ||
    false

const getParsedSolvers = async (
    proposalStack: ProposalStackType,
    currentUser: UserType
) => {
    const _compositionWithFlexInputs = mergeFlexIntoComposition(
        mergeFlexIntoComposition(
            proposalStack.compositionDoc.content,
            proposalStack.templateDoc.content.flexInputs
        ),
        proposalStack.proposalDoc.content.flexInputs
    )

    if (proposalStack.templateDoc.content.price.isCollateralFlex) {
        _compositionWithFlexInputs.solvers.forEach((solver) => {
            solver.config.collateralToken =
                proposalStack.proposalDoc.content.price.tokenAddress
        })
    }

    const _parsedSolvers = await parseComposerSolvers(
        _compositionWithFlexInputs.solvers,
        currentUser.web3Provider
    )

    console.log(_parsedSolvers)

    return _parsedSolvers
}

export const deployProposal = async (
    currentUser: UserType,
    proposalStack: ProposalStackType
) => {
    // TODO Sanity check function that this is approved
    const parsedSolvers = await getParsedSolvers(proposalStack, currentUser)

    if (parsedSolvers) {
        const proposalsHub = new ProposalsHub(
            currentUser.signer,
            currentUser.chainId
        )

        const solutionSafeBaseId = getSolutionSafeBaseId(
            proposalStack.proposalDoc.commitId.toString(),
            proposalStack.proposalDoc.content.template.commitID
        )

        const transaction = await proposalsHub.createProposal(
            parsedSolvers[0].collateralToken,
            proposalStack.proposalDoc.content.price.amount,
            solutionSafeBaseId,
            parsedSolvers.map((solver) => solver.config),
            proposalStack.proposalDoc.commitId.toString()
        )
        let rc = await transaction.wait()
        const event = rc.events?.find(
            (event) => event.event === 'CreateProposal'
        )
        console.log(event)
        if (!event) throw GENERAL_ERROR['FAILED_PROPOSAL_DEPLOYMENT']

        // If for some reason some POS wants to DOS we can save the correct id nonce
        // on ceramic to save time for subsequent loads
    }
}

export const deploySolutionBase = async (
    currentUser: UserType,
    proposalStack: ProposalStackType,
    ceramicStagehand: CeramicStagehand
) => {
    try {
        const parsedSolvers = await getParsedSolvers(proposalStack, currentUser)

        if (parsedSolvers) {
            // Pin solverConfigs separately to have access without metaData from Solution
            const solverConfigsDoc = await ceramicStagehand.createSolverConfigs(
                parsedSolvers,
                proposalStack.proposalDoc.commitId.toString()
            )

            if (!solverConfigsDoc) throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']

            const solutionsHub = new IPFSSolutionsHub(
                currentUser.signer,
                currentUser.chainId
            )

            const solutionBaseId: string = getSolutionBaseId(
                proposalStack.proposalDoc.commitId.toString(),
                proposalStack.proposalDoc.content.template.commitID
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
