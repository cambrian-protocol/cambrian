import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import { Box } from 'grommet'
import { StageStackType } from '../../dashboard/ProposalsDashboardUI'
import TemplatePreview from '../../templates/TemplatePreview'

interface TemplateInfoModalProps {
    stageStack: StageStackType
    onClose: () => void
}

const TemplateInfoModal = ({ stageStack, onClose }: TemplateInfoModalProps) => (
    <BaseLayerModal onClose={onClose} width="xlarge">
        <Box height={{ min: 'auto' }}>
            <TemplatePreview template={stageStack.template} />
        </Box>
    </BaseLayerModal>
)

export default TemplateInfoModal
