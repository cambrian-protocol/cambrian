import { Box, Heading, Text } from 'grommet'

import BaseAvatar from '@cambrian/app/components/avatars/BaseAvatar'
import { CeramicTemplateModel } from '@cambrian/app/models/TemplateModel'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import TemplatePricingInfo from '@cambrian/app/components/info/TemplatePricingInfo'
import { usePublicRecord } from '@self.id/framework'

interface ViewTemplateUIProps {
    template: CeramicTemplateModel
    showQuote?: boolean
}

const TemplateInfo = ({ template, showQuote }: ViewTemplateUIProps) => {
    const sellerBasicProfile = usePublicRecord('basicProfile', template.author)
    return (
        <Box height={{ min: '90vh' }} justify="center" direction="row">
            <Box width={'large'} gap="medium">
                <Heading level="2">{template.title}</Heading>
                <Box direction="row" align="center" gap="medium">
                    <BaseAvatar
                        pfpPath={sellerBasicProfile.content?.avatar as string}
                    />
                    <Box>
                        <Heading level="4">
                            {sellerBasicProfile.content?.name}
                        </Heading>
                        <Text size="small" color="dark-4">
                            {sellerBasicProfile.content?.title as string}
                        </Text>
                    </Box>
                </Box>
                <PlainSectionDivider />
                <Heading level="3">About this Template</Heading>
                <Text color="dark-4" style={{ whiteSpace: 'pre-line' }}>
                    {template.description}
                </Text>
                {template.requirements.trim() !== '' && (
                    <Box gap="medium">
                        <Heading level="4">Requirements</Heading>
                        <Text color="dark-4" style={{ whiteSpace: 'pre-line' }}>
                            {template.requirements}
                        </Text>
                    </Box>
                )}
                <PlainSectionDivider />
                {showQuote && (
                    <Box border round="xsmall" pad="medium">
                        <TemplatePricingInfo template={template} />
                    </Box>
                )}
                <Heading level="3">About the Seller</Heading>
                <Box direction="row" gap="medium" align="center">
                    <BaseAvatar
                        pfpPath={sellerBasicProfile.content?.avatar as string}
                        size="medium"
                    />
                    <Box>
                        <Heading level="3">
                            {sellerBasicProfile.content?.name}
                        </Heading>
                        <Text size="small" color="dark-4">
                            {sellerBasicProfile.content?.title as string}
                        </Text>
                    </Box>
                </Box>
                <Text color="dark-4" style={{ whiteSpace: 'pre-line' }}>
                    {sellerBasicProfile.content?.description}
                </Text>
            </Box>
        </Box>
    )
}

export default TemplateInfo
