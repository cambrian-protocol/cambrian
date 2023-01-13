import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import { Box } from 'grommet'
import ProposalPreview from '../../proposals/ProposalPreview'
import { StageStackType } from '../../dashboard/ProposalsDashboardUI'
import { TokenModel } from '@cambrian/app/models/TokenModel'

interface ProposalInfoModalProps {
    onClose: () => void
    stageStack: StageStackType
    collateralToken: TokenModel
}

const ProposalInfoModal = ({
    onClose,
    stageStack,
    collateralToken,
}: ProposalInfoModalProps) => (
    <BaseLayerModal onClose={onClose} width="xlarge">
        <Box height={{ min: 'auto' }} gap="medium">
            <ProposalPreview
                stageStack={stageStack}
                collateralToken={collateralToken}
                showProposalLink
            />
        </Box>
    </BaseLayerModal>
)

export default ProposalInfoModal
