import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import { CeramicTemplateModel } from '@cambrian/app/models/TemplateModel'
import TemplateContentInfo from '../../templates/TemplateContentInfo'
import TemplateFlexInputInfo from '../../templates/TemplateInfo'
import TemplatePricingInfo from '@cambrian/app/components/info/TemplatePricingInfo'

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
            <TemplateContentInfo template={ceramicTemplate} />
            <TemplatePricingInfo template={ceramicTemplate} />
            <TemplateFlexInputInfo template={ceramicTemplate} />
        </BaseLayerModal>
    )
}

export default TemplateInfoModal
