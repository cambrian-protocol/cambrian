import { Box, Heading, Text } from 'grommet'

import BaseAvatar from '@cambrian/app/components/avatars/BaseAvatar'
import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import { CeramicTemplateModel } from '@cambrian/app/models/TemplateModel'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import { usePublicRecord } from '@self.id/framework'

interface TemplateInfoModalProps {
    template: CeramicTemplateModel
    onClose: () => void
}

// TODO Display Sellers Price quote
const TemplateInfoModal = ({ template, onClose }: TemplateInfoModalProps) => {
    const sellerBasicProfile = usePublicRecord('basicProfile', template.author)

    return (
        <BaseLayerModal onClose={onClose}>
            <Box gap="medium" height={{ min: 'auto' }}>
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
        </BaseLayerModal>
    )
}

export default TemplateInfoModal
