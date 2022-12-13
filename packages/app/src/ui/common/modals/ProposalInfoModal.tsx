import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import { Box } from 'grommet'
import ProposalHeader from '@cambrian/app/components/layout/header/ProposalHeader'
import ProposalPreview from '../../proposals/ProposalPreview'
import { ProposalStatus } from '@cambrian/app/models/ProposalStatus'
import { StageStackType } from '../../dashboard/ProposalsDashboardUI'
import { TokenModel } from '@cambrian/app/models/TokenModel'

interface ProposalInfoModalProps {
    onClose: () => void
    stageStack: StageStackType
    collateralToken: TokenModel
    proposalStatus?: ProposalStatus
}

const ProposalInfoModal = ({
    onClose,
    stageStack,
    collateralToken,
    proposalStatus,
}: ProposalInfoModalProps) => (
    <BaseLayerModal onClose={onClose} width="xlarge">
        <Box height={{ min: 'auto' }} gap="medium">
            <ProposalHeader
                collateralToken={collateralToken}
                stageStack={stageStack}
                proposalStatus={proposalStatus}
                showProposalLink
            />
            <ProposalPreview
                stageStack={stageStack}
                collateralToken={collateralToken}
                showProposalLink
            />
        </Box>
    </BaseLayerModal>
)

export default ProposalInfoModal
