import {
    CeramicTemplateModel,
    ReceivedProposalsHashmapType,
} from '@cambrian/app/models/TemplateModel'

import { CeramicProposalModel } from '@cambrian/app/models/ProposalModel'
import CeramicStagehand from '@cambrian/app/classes/CeramicStagehand'
import { ProposalStatus } from '@cambrian/app/models/ProposalStatus'
import ProposalsHub from '@cambrian/app/hubs/ProposalsHub'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { UserType } from '@cambrian/app/store/UserContext'
import { ethers } from 'ethers'

export const getProposalStatus = async (
    proposalDoc: TileDocument<CeramicProposalModel>,
    templateDoc: TileDocument<CeramicTemplateModel>,
    currentUser: UserType,
    ceramicStagehand: CeramicStagehand
): Promise<ProposalStatus> => {
    const proposalCommits =
        templateDoc.content.receivedProposals[proposalDoc.id.toString()]
    if (proposalCommits) {
        if (
            proposalCommits[proposalCommits.length - 1].proposalCommitID ===
            proposalDoc.commitId.toString()
        ) {
            const proposalCommit = proposalCommits[proposalCommits.length - 1]
            if (proposalCommit.approved) {
                const onChainProposal = await getOnChainProposal(
                    currentUser,
                    proposalDoc,
                    ceramicStagehand
                )
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
 * @param templateDoc Template STREAM TileDocument
 * @returns The latest registered proposal submission from the templates receivedProposals
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
    proposalStreamDoc: TileDocument<CeramicProposalModel>,
    ceramicStagehand: CeramicStagehand
) => {
    const proposalsHub = new ProposalsHub(
        currentUser.signer,
        currentUser.chainId
    )
    const proposalID = await getOnChainProposalId(
        proposalStreamDoc.commitId.toString(),
        proposalStreamDoc.content.template.commitID
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
