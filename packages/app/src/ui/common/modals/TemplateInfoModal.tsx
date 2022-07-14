import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import { CeramicTemplateModel } from '@cambrian/app/models/TemplateModel'
import TemplateInfo from '../../templates/TemplateInfo'

interface TemplateInfoModalProps {
    ceramicTemplate: CeramicTemplateModel
    onClose: () => void
}

const TemplateInfoModal = ({
    ceramicTemplate,
    onClose,
}: TemplateInfoModalProps) => {
    return (
        <BaseLayerModal onClose={onClose}>
            <TemplateInfo template={ceramicTemplate} showQuote />
        </BaseLayerModal>
    )
}

export default TemplateInfoModal
