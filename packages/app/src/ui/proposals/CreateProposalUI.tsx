import AvatarWithLabel from '@cambrian/app/components/avatars/AvatarWithLabel'
import { Box } from 'grommet'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import CreateProposalForm from './forms/CreateProposalForm'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import React from 'react'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'

interface CreateProposalUIProps {
    composition: CompositionModel
    template: TemplateModel
    templateCID: string
}

const CreateProposalUI = ({
    composition,
    template,
    templateCID,
}: CreateProposalUIProps) => (
    <>
        <HeaderTextSection
            title={template.title}
            subTitle="Create Proposal"
            paragraph={template.description}
        />
        <AvatarWithLabel
            role="Seller"
            label={template.name}
            pfpPath={template.pfp}
        />
        <HeaderTextSection
            subTitle="Define your proposal"
            paragraph='Enter the details of your proposal below. Enter the total funding required as "price".'
        />
        <Box fill>
            <CreateProposalForm
                composition={composition}
                template={template}
                templateCID={templateCID}
            />
            <Box pad="medium" />
        </Box>
    </>
)

export default CreateProposalUI
