import BaseHeader from './BaseHeader'
import { DocumentModel } from '@cambrian/app/services/api/cambrian.api'
import HeaderProposalLinkButton from '../../buttons/ProposalLinkButton'
import { ProposalModel } from '@cambrian/app/models/ProposalModel'
import React from 'react'
import useCambrianProfile from '@cambrian/app/hooks/useCambrianProfile'

interface IProposalModalHeader {
    proposalDoc: DocumentModel<ProposalModel>
}

const ProposalModalHeader = ({ proposalDoc }: IProposalModalHeader) => {
    const [proposerProfile] = useCambrianProfile(proposalDoc.content.author)
    return (
        <BaseHeader
            title={proposalDoc.content.title}
            metaTitle="Proposal"
            items={[
                <HeaderProposalLinkButton
                    proposalStreamID={proposalDoc.streamID}
                />,
            ]}
            authorProfileDoc={proposerProfile}
        />
    )
}

export default ProposalModalHeader
