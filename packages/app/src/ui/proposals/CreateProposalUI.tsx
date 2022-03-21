import CreateProposalForm, {
    CreateProposalFormType,
} from './forms/CreateProposalForm'

import { Box } from 'grommet'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import ParticipantAvatar from '@cambrian/app/components/avatars/AvatarWithTitle'
import React from 'react'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'

interface CreateProposalUIProps {
    template: TemplateModel
    onCreateProposal: (proposalInput: CreateProposalFormType) => void
}

const CreateProposalUI = ({
    template,
    onCreateProposal,
}: CreateProposalUIProps) => (
    <>
        <HeaderTextSection
            title={template.title}
            subTitle="Create Proposal"
            paragraph={template.description}
        />
        <ParticipantAvatar
            role="Seller"
            title={template.name}
            pfpPath={template.pfp}
        />
        <HeaderTextSection
            subTitle="Define your proposal"
            paragraph='Enter the details of your proposal below. Enter the total funding required as "price".'
        />
        <Box fill>
            <CreateProposalForm
                template={template}
                onSubmit={onCreateProposal}
            />
            <Box pad="medium" />
        </Box>
    </>
)

export default CreateProposalUI
