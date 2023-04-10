import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import { Box } from 'grommet'
import { DocumentModel } from '@cambrian/app/services/api/cambrian.api'
import TemplateBody from '../../templates/TemplateBody'
import TemplateModalHeader from '@cambrian/app/components/layout/header/TemplateModalHeader'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import { TokenModel } from '@cambrian/app/models/TokenModel'

interface TemplateInfoModalProps {
    templateDoc: DocumentModel<TemplateModel>
    denominationToken: TokenModel
    onClose: () => void
}

const TemplateInfoModal = ({
    templateDoc,
    denominationToken,
    onClose,
}: TemplateInfoModalProps) => (
    <BaseLayerModal onClose={onClose} width="xlarge">
        <Box height={{ min: 'auto' }}>
            <TemplateModalHeader templateDoc={templateDoc} />
            <TemplateBody
                templateContent={templateDoc.content}
                denominationToken={denominationToken}
            />
        </Box>
    </BaseLayerModal>
)

export default TemplateInfoModal
