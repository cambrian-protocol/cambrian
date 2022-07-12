import { ProposalStatus } from '@cambrian/app/models/ProposalStatus'
import { ReceivedProposalPropsType } from '@cambrian/app/models/TemplateModel'

export const initProposalStatus = (
    proposalStreamEntries: ({
        proposalCommitID: string
    } & ReceivedProposalPropsType)[],
    proposalCommitID: string,
    isSubmitted: boolean
): ProposalStatus => {
    if (
        proposalStreamEntries &&
        proposalStreamEntries[proposalStreamEntries.length - 1]
            .proposalCommitID === proposalCommitID
    ) {
        const proposalEntry =
            proposalStreamEntries[proposalStreamEntries.length - 1]

        if (proposalEntry.approved) {
            return ProposalStatus.Approved
        } else if (proposalEntry.requestChange) {
            return ProposalStatus.ChangeRequested
        } else {
            return ProposalStatus.OnReview
        }
    } else {
        if (isSubmitted) {
            return ProposalStatus.OnReview
        } else {
            return ProposalStatus.Draft
        }
    }
}
