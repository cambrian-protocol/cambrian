import { Box, Heading, Text } from 'grommet'

import CambrianProfileAbout from '@cambrian/app/components/info/CambrianProfileAbout'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import PriceInfo from '@cambrian/app/components/info/PriceInfo'
import { ProposalModel } from '@cambrian/app/models/ProposalModel'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import useCambrianProfile from '@cambrian/app/hooks/useCambrianProfile'

interface IProposalBody {
    proposalContent: ProposalModel
    collateralToken: TokenModel
}

const ProposalBody = ({ proposalContent, collateralToken }: IProposalBody) => {
    const [proposerProfile] = useCambrianProfile(proposalContent.author)

    return (
        <Box gap="medium">
            <Box gap="small">
                <Heading level="3">Project details</Heading>
                <Text style={{ whiteSpace: 'pre-line' }}>
                    {proposalContent.description}
                </Text>
            </Box>
            <PlainSectionDivider />
            <PriceInfo
                label={'Price'}
                amount={proposalContent.price.amount}
                token={collateralToken} // Todo check changed token
            />
            <PlainSectionDivider />
            {proposerProfile && (
                <Box gap="small">
                    <Heading level="4">About the author</Heading>
                    <CambrianProfileAbout cambrianProfile={proposerProfile} />
                </Box>
            )}
        </Box>
    )
}

export default ProposalBody
