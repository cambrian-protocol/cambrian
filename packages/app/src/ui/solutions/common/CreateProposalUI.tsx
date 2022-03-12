import React, { useState } from 'react'

import { Box } from 'grommet'
import CreateProposalForm from './forms/CreateProposalForm'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import ParticipantAvatar from '@cambrian/app/components/avatars/AvatarWithTitle'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'

interface CreateProposalUIProps {
    template: TemplateModel
}

const CreateProposalUI = ({ template }: CreateProposalUIProps) => {
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const toggleShowSuccessModal = () => setShowSuccessModal(!showSuccessModal)

    // WIP
    const [createdProposalCID, setCreatedProposalCID] = useState<string>()

    const handleSuccess = (createdProposalCID: string) => {
        setCreatedProposalCID(createdProposalCID)
        toggleShowSuccessModal()
    }

    return (
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
                subTitle="Define the topic and price"
                paragraph="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel erat et enim blandit pharetra. Nam nec justo ultricies, tristique justo eget, dignissim turpis. "
            />
            <Box fill>
                <CreateProposalForm template={template} />
                <Box pad="medium" />
            </Box>
        </>
    )
}

export default CreateProposalUI
