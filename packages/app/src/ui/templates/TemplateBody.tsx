import { Box, Heading, Text } from 'grommet'

import CambrianProfileAbout from '@cambrian/app/components/info/CambrianProfileAbout'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import PriceInfo from '@cambrian/app/components/info/PriceInfo'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import useCambrianProfile from '@cambrian/app/hooks/useCambrianProfile'

interface ITemplateBody {
    templateContent: TemplateModel
    denominationToken: TokenModel
}

const TemplateBody = ({
    templateContent,
    denominationToken,
}: ITemplateBody) => {
    const [templaterProfile] = useCambrianProfile(templateContent.author)

    return (
        <Box gap="medium">
            <Box gap="small">
                <Heading level="3">Project details</Heading>
                <Text style={{ whiteSpace: 'pre-line' }}>
                    {templateContent.description}
                </Text>
            </Box>
            {templateContent.requirements.length > 0 && (
                <Box gap="small">
                    <Heading level="4">Requirements</Heading>
                    <Text color="dark-4" style={{ whiteSpace: 'pre-line' }}>
                        {templateContent.requirements}
                    </Text>
                </Box>
            )}
            <PlainSectionDivider />
            <PriceInfo
                label="Price"
                amount={templateContent.price.amount || 0}
                token={denominationToken}
                allowAnyPaymentToken={
                    templateContent.price.allowAnyPaymentToken
                }
                preferredTokens={templateContent.price.preferredTokens}
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

export default TemplateBody
