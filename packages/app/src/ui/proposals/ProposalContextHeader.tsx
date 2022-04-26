import AvatarWithLabel from '@cambrian/app/components/avatars/AvatarWithLabel'
import BaseFormGroupContainer from '@cambrian/app/components/containers/BaseFormGroupContainer'
import { Box } from 'grommet'
import { Handshake } from 'phosphor-react'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import { ProposalModel } from '@cambrian/app/models/ProposalModel'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'

interface ProposalContextHeaderProps {
    proposal: ProposalModel
    template: TemplateModel
}

const ProposalContextHeader = ({
    proposal,
    template,
}: ProposalContextHeaderProps) => {
    return (
        <Box gap="medium" height={{ min: 'auto' }}>
            <BaseFormGroupContainer border groupTitle="Agreement between">
                <Box
                    direction="row"
                    height={{ min: 'auto' }}
                    justify="around"
                    align="center"
                >
                    <AvatarWithLabel
                        label={template.name}
                        pfpPath={template.pfp}
                        role="Seller"
                    />
                    <Handshake size="24" />
                    <AvatarWithLabel
                        label={proposal.name}
                        pfpPath={proposal.pfp}
                        role="Buyer"
                    />
                </Box>
            </BaseFormGroupContainer>
            <BaseFormGroupContainer groupTitle="Template details">
                <HeaderTextSection
                    title={template.title}
                    paragraph={template.description}
                />
            </BaseFormGroupContainer>
            <BaseFormGroupContainer groupTitle="Proposal details">
                <HeaderTextSection
                    title={proposal.title}
                    paragraph={proposal.description}
                />
            </BaseFormGroupContainer>
        </Box>
    )
}

export default ProposalContextHeader
