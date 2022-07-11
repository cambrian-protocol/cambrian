import { ProposalStatus } from '@cambrian/app/models/ProposalStatus'
import { ReceivedProposalPropsType } from '@cambrian/app/models/TemplateModel'
import { SetStateAction } from 'react'

export const initProposalStatus = (
    proposalStreamEntries: ({
        proposalCommitID: string
    } & ReceivedProposalPropsType)[],
    proposalCommitID: string,
    isSubmitted: boolean,
    setProposalStatus: React.Dispatch<SetStateAction<ProposalStatus>>
) => {
    if (
        proposalStreamEntries &&
        proposalStreamEntries[proposalStreamEntries.length - 1]
            .proposalCommitID === proposalCommitID
    ) {
        const proposalEntry =
            proposalStreamEntries[proposalStreamEntries.length - 1]

        if (proposalEntry.approved) {
            setProposalStatus(ProposalStatus.Approved)
        } else if (proposalEntry.requestChange) {
            setProposalStatus(ProposalStatus.ChangeRequested)
        } else {
            setProposalStatus(ProposalStatus.OnReview)
        }
    } else {
        if (isSubmitted) {
            setProposalStatus(ProposalStatus.OnReview)
        } else {
            setProposalStatus(ProposalStatus.Draft)
        }
    }
}
