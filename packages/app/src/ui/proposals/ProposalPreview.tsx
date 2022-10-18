import { Box, Heading, Text } from 'grommet'

import CambrianProfileAbout from '@cambrian/app/components/info/CambrianProfileAbout'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import PriceInfo from '@cambrian/app/components/info/PriceInfo'
import ProposalControlbar from './control/ProposalControlbar'
import ProposalHeader from '@cambrian/app/components/layout/header/ProposalHeader'
import { ProposalStatus } from '@cambrian/app/models/ProposalStatus'
import { StageStackType } from '../dashboard/ProposalsDashboardUI'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import useCambrianProfile from '@cambrian/app/hooks/useCambrianProfile'

interface ProposalPreviewProps {
    stageStack: StageStackType
    proposalStatus?: ProposalStatus
    collateralToken?: TokenModel
    showConfiguration?: boolean
}

const ProposalPreview = ({
    stageStack,
    proposalStatus,
    collateralToken,
    showConfiguration,
}: ProposalPreviewProps) => {
    const [proposerProfile] = useCambrianProfile(stageStack.proposal.author)
    return (
        <Box gap="medium">
            <ProposalHeader
                collateralToken={collateralToken}
                stageStack={stageStack}
                proposalStatus={proposalStatus}
                showConfiguration={showConfiguration}
            />
            <Box gap="small">
                <Heading level="3">Project details</Heading>
                <Text style={{ whiteSpace: 'pre-line' }}>
                    {stageStack.proposal.description}
                </Text>
            </Box>
            <PlainSectionDivider />
            <PriceInfo
                label={
                    proposalStatus === ProposalStatus.Funding
                        ? 'Goal'
                        : proposalStatus === ProposalStatus.Executed
                        ? 'Price'
                        : 'Proposed Price'
                }
                amount={stageStack.proposal.price.amount}
                token={collateralToken}
            />
            <PlainSectionDivider />
            {proposerProfile && (
                <CambrianProfileAbout cambrianProfile={proposerProfile} />
            )}
            <ProposalControlbar />
        </Box>
    )
}

export default ProposalPreview
