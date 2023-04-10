import Proposal from '@cambrian/app/classes/stages/Proposal'
import ProposerChangeRequestedBar from '../proposer/ProposerChangeRequestedBar'
import React from 'react'
import TemplaterChangeRequestedBar from '../templater/TemplaterChangeRequestedBar'

interface IChangeRequestedBar {
    proposal: Proposal
}

const ChangeRequestedBar = ({ proposal }: IChangeRequestedBar) => {
    if (proposal.isProposalAuthor) {
        return <ProposerChangeRequestedBar proposal={proposal} />
    }

    if (proposal.isTemplateAuthor) {
        return <TemplaterChangeRequestedBar />
    }

    return null
}

export default ChangeRequestedBar
