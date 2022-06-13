import AvatarWithLabel from '@cambrian/app/components/avatars/AvatarWithLabel'
import BaseFormGroupContainer from '@cambrian/app/components/containers/BaseFormGroupContainer'
import { Box } from 'grommet'
import { Handshake } from 'phosphor-react'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import { ProposalModel } from '@cambrian/app/models/ProposalModel'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'

interface ProposalTemplateInfoComponentProps {
    proposalMetadata?: ProposalModel
    templateMetadata?: TemplateModel
}

const ProposalTemplateInfoComponent = ({
    proposalMetadata,
    templateMetadata,
}: ProposalTemplateInfoComponentProps) => (
    <Box gap="medium" height={{ min: 'auto' }}>
        {proposalMetadata && templateMetadata && (
            <BaseFormGroupContainer groupTitle="Agreement between">
                <Box
                    direction="row"
                    height={{ min: 'auto' }}
                    justify="around"
                    align="center"
                >
                    <AvatarWithLabel
                        label={templateMetadata.name}
                        pfpPath={templateMetadata.pfp}
                        role="Seller"
                    />
                    <Handshake size="24" />
                    <AvatarWithLabel
                        label={proposalMetadata.name}
                        pfpPath={proposalMetadata.pfp}
                        role="Buyer"
                    />
                </Box>
            </BaseFormGroupContainer>
        )}
        {proposalMetadata && (
            <BaseFormGroupContainer groupTitle="Proposal details">
                <HeaderTextSection
                    title={proposalMetadata.title}
                    paragraph={proposalMetadata.description}
                />
            </BaseFormGroupContainer>
        )}
        {templateMetadata && (
            <BaseFormGroupContainer groupTitle="Template details">
                <HeaderTextSection
                    title={templateMetadata.title}
                    paragraph={templateMetadata.description}
                />
            </BaseFormGroupContainer>
        )}
    </Box>
)

export default ProposalTemplateInfoComponent
