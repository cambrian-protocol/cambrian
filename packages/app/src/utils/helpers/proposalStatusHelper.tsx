import { CeramicProposalModel } from '@cambrian/app/models/ProposalModel'
import { ProposalStatus } from '@cambrian/app/models/ProposalStatus'
import { ReceivedProposalPropsType } from '@cambrian/app/models/TemplateModel'

export const initProposalStatus = (
    proposalStreamEntries: ({
        proposalCommitID: string
    } & ReceivedProposalPropsType)[],
    proposalCommitID: string,
    ceramicProposal: CeramicProposalModel
): ProposalStatus => {
    if (
        proposalStreamEntries &&
        proposalStreamEntries[proposalStreamEntries.length - 1]
            .proposalCommitID === proposalCommitID
    ) {
        const proposalEntry =
            proposalStreamEntries[proposalStreamEntries.length - 1]

        if (
            proposalEntry.proposalID !== undefined ||
            ceramicProposal.proposalID !== undefined
        ) {
            // TODO determine if onchain proposal is executed, consider adding third onchain status: ProposalStatus.Funded
            return ProposalStatus.Funding
        } else if (proposalEntry.approved) {
            return ProposalStatus.Approved
        } else if (proposalEntry.requestChange) {
            return ProposalStatus.ChangeRequested
        } else {
            return ProposalStatus.OnReview
        }
    } else {
        if (ceramicProposal.submitted) {
            return ProposalStatus.OnReview
        } else {
            return ProposalStatus.Draft
        }
    }
}
