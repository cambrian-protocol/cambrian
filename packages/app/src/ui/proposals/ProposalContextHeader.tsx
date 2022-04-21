import AvatarWithLabel from '@cambrian/app/components/avatars/AvatarWithLabel'
import { Box } from 'grommet'
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
        <Box height={{ min: 'auto' }}>
            <HeaderTextSection
                title={proposal.title}
                subTitle="Proposal Overview"
                paragraph={proposal.description}
            />
            <HeaderTextSection
                title={template.title}
                subTitle="Template overview"
                paragraph={template.description}
            />
            <Box
                direction="row"
                height={{ min: 'auto' }}
                justify="around"
                align="start"
            >
                <AvatarWithLabel
                    label={template.name}
                    pfpPath={template.pfp}
                    role="Seller"
                />
                <AvatarWithLabel
                    label={proposal.name}
                    pfpPath={proposal.pfp}
                    role="Buyer"
                />
            </Box>
        </Box>
    )
}

export default ProposalContextHeader
