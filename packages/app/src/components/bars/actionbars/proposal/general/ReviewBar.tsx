import Proposal from '@cambrian/app/classes/stages/Proposal'
import ProposerReviewBar from '../proposer/ProposerReviewBar'
import React from 'react'
import TemplaterReviewBar from '../templater/TemplaterReviewBar'

interface IReviewBar {
    proposal: Proposal
}

const ReviewBar = ({ proposal }: IReviewBar) => {
    if (proposal.isProposalAuthor) {
        return <ProposerReviewBar />
    }

    if (proposal.isTemplateAuthor) {
        return <TemplaterReviewBar proposal={proposal} />
    }

    return null
}

export default ReviewBar
