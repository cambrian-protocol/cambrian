import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import { Box } from 'grommet'
import Template from '@cambrian/app/classes/stages/Template'
import TemplatePreview from '../../templates/TemplatePreview'

interface TemplateInfoModalProps {
    template: Template
    onClose: () => void
}

const TemplateInfoModal = ({ template, onClose }: TemplateInfoModalProps) => (
    <BaseLayerModal onClose={onClose} width="xlarge">
        <Box height={{ min: 'auto' }}>
            <TemplatePreview template={template} />
        </Box>
    </BaseLayerModal>
)

export default TemplateInfoModal
