import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import { CeramicTemplateModel } from '@cambrian/app/models/TemplateModel'
import TemplateInfo from '../../templates/TemplateInfo'
import { usePublicRecord } from '@self.id/framework'

interface TemplateInfoModalProps {
    ceramicTemplate: CeramicTemplateModel
    onClose: () => void
}

const TemplateInfoModal = ({
    ceramicTemplate,
    onClose,
}: TemplateInfoModalProps) => {
    const sellerBasicProfile = usePublicRecord(
        'basicProfile',
        ceramicTemplate.author
    )

    return (
        <BaseLayerModal onClose={onClose}>
            <TemplateInfo
                sellerBasicProfile={sellerBasicProfile}
                template={ceramicTemplate}
                showQuote
            />
        </BaseLayerModal>
    )
}

export default TemplateInfoModal
