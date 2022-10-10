import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import { Box } from 'grommet'
import { File } from 'phosphor-react'
import ModalHeader from '@cambrian/app/components/layout/header/ModalHeader'
import { StageStackType } from '../../dashboard/ProposalsDashboardUI'
import TemplatePreview from '../../templates/TemplatePreview'

interface TemplateInfoModalProps {
    stageStack: StageStackType
    onClose: () => void
}

const TemplateInfoModal = ({ stageStack, onClose }: TemplateInfoModalProps) => {
    return (
        <BaseLayerModal onClose={onClose}>
            <Box height={{ min: 'auto' }}>
                <ModalHeader
                    title="Template Info"
                    description="Details about the template, it's settings and the creator"
                    icon={<File />}
                />
                <TemplatePreview template={stageStack.template} />
            </Box>
        </BaseLayerModal>
    )
}

export default TemplateInfoModal
