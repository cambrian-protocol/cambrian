import { Box, Heading, Text } from 'grommet'

import CambrianProfileAbout from '@cambrian/app/components/info/CambrianProfileAbout'
import { CambrianProfileType } from '@cambrian/app/store/UserContext'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import PriceInfo from '@cambrian/app/components/info/PriceInfo'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { TokenModel } from '@cambrian/app/models/TokenModel'

interface TemplatePreviewProps {
    template: TemplateModel
    collateralToken?: TokenModel
    templaterProfile?: TileDocument<CambrianProfileType>
}

const TemplatePreview = ({
    template,
    collateralToken,
    templaterProfile,
}: TemplatePreviewProps) => {
    return (
        <Box gap="medium">
            <Box gap="small">
                <Heading level="3">Description</Heading>
                <Text style={{ whiteSpace: 'pre-line' }}>
                    {template.description}
                </Text>
            </Box>
            {template.requirements.length > 0 && (
                <Box gap="small">
                    <Heading level="4">Requirements</Heading>
                    <Text color="dark-4" style={{ whiteSpace: 'pre-line' }}>
                        {template.requirements}
                    </Text>
                </Box>
            )}
            <PlainSectionDivider />
            <PriceInfo
                label="Price"
                amount={template.price.amount || 0}
                token={collateralToken}
                allowAnyPaymentToken={template.price.allowAnyPaymentToken}
                preferredTokens={template.price.preferredTokens}
            />
            <PlainSectionDivider />
            {templaterProfile && (
                <Box gap="small">
                    <Heading level="4">About the author</Heading>
                    <CambrianProfileAbout cambrianProfile={templaterProfile} />
                </Box>
            )}
        </Box>
    )
}

export default TemplatePreview
