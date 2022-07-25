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

export const getProposalStatus = (
    proposalDoc: TileDocument<CeramicProposalModel>,
    templateDoc: TileDocument<CeramicTemplateModel>
): ProposalStatus => {
    const proposalCommits =
        templateDoc.content.receivedProposals[proposalDoc.id.toString()]
    if (proposalCommits) {
        if (
            proposalCommits[proposalCommits.length - 1].proposalCommitID ===
            proposalDoc.commitId.toString()
        ) {
            const proposalCommit = proposalCommits[proposalCommits.length - 1]
            if (proposalCommit.approved) {
                return ProposalStatus.Approved
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
    const proposalID = await ceramicStagehand.getOnChainProposalId(
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
