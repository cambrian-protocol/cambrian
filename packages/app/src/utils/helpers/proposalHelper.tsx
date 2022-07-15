import { CeramicProposalModel } from '@cambrian/app/models/ProposalModel'
import { CeramicTemplateModel } from '@cambrian/app/models/TemplateModel'
import { ProposalStatus } from '@cambrian/app/models/ProposalStatus'
import { TileDocument } from '@ceramicnetwork/stream-tile'

export const initProposalStatus = (
    templateDoc: TileDocument<CeramicTemplateModel>,
    proposalDoc: TileDocument<CeramicProposalModel>
): ProposalStatus => {
    const proposalCommits =
        templateDoc.content.receivedProposals[proposalDoc.id.toString()]

    if (
        proposalCommits &&
        proposalCommits[proposalCommits.length - 1].proposalCommitID ===
            proposalDoc.commitId.toString()
    ) {
        const proposalCommit = proposalCommits[proposalCommits.length - 1]

        if (
            proposalCommit.proposalID !== undefined ||
            proposalDoc.content.proposalID !== undefined
        ) {
            // TODO determine if onchain proposal is executed, consider adding third onchain status: ProposalStatus.Funded
            return ProposalStatus.Funding
        } else if (proposalCommit.approved) {
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
            return ProposalStatus.Draft
        }
    }
}

/**
 * Returns the latest registered proposalCommit from the templateStream
 *
 * @param proposalDoc Proposal STREAM TileDocument
 * @param templateDoc Template STREAM TileDocument
 * @returns The latest registered proposal submission from the templates receivedProposals
 */
export const getLatestProposalSubmission = (
    proposalDoc: TileDocument<CeramicProposalModel>,
    templateDoc: TileDocument<CeramicTemplateModel>
) => {
    const registeredProposal =
        templateDoc.content.receivedProposals[proposalDoc.id.toString()]

    if (registeredProposal) {
        const latestProposalCommit =
            registeredProposal[registeredProposal.length - 1]

        if (latestProposalCommit) {
            return latestProposalCommit
        }
    }
}
