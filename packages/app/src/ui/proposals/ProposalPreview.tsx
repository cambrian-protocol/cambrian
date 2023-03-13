import { Box, Heading, Text } from 'grommet'

import CambrianProfileAbout from '@cambrian/app/components/info/CambrianProfileAbout'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import PriceInfo from '@cambrian/app/components/info/PriceInfo'
import Proposal from '@cambrian/app/classes/stages/Proposal'
import ProposalHeader from '@cambrian/app/components/layout/header/ProposalHeader'
import { ProposalModel } from '@cambrian/app/models/ProposalModel'
import { ProposalStatus } from '@cambrian/app/models/ProposalStatus'
import useCambrianProfile from '@cambrian/app/hooks/useCambrianProfile'

interface ProposalPreviewProps {
    proposal: Proposal
    proposalDisplayData: ProposalModel
    showComposition?: boolean
    showProposalLink?: boolean
}

const ProposalPreview = ({
    proposal,
    proposalDisplayData,
    showComposition,
    showProposalLink,
}: ProposalPreviewProps) => {
    const [proposerProfile] = useCambrianProfile(proposal.content.author)

    return (
        <Box gap="medium">
            <ProposalHeader
                proposal={proposal}
                proposalDisplayData={proposalDisplayData}
                showProposalLink={showProposalLink}
            />
            <Box gap="small">
                <Heading level="3">Project details</Heading>
                <Text style={{ whiteSpace: 'pre-line' }}>
                    {proposalDisplayData.description}
                </Text>
            </Box>
            <PlainSectionDivider />
            <PriceInfo
                label={
                    proposal.status === ProposalStatus.Funding
                        ? 'Goal'
                        : proposal.status === ProposalStatus.Executed
                        ? 'Price'
                        : 'Proposed Price'
                }
                amount={proposalDisplayData.price.amount}
                token={proposal.collateralToken} // Todo check changed token
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

export default ProposalPreview
