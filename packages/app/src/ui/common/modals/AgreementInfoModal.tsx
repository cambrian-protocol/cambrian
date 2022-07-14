import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import { CeramicProposalModel } from '@cambrian/app/models/ProposalModel'
import { CeramicTemplateModel } from '@cambrian/app/models/TemplateModel'
import ProposalInfo from '../../proposals/ProposalInfo'
import TemplateInfo from '../../templates/TemplateInfo'

interface AgreementInfoModalProps {
    onClose: () => void
    template: CeramicTemplateModel
    ceramicProposal: CeramicProposalModel
}

const AgreementInfoModal = ({
    onClose,
    template,
    ceramicProposal,
}: AgreementInfoModalProps) => {
    return (
        <BaseLayerModal onClose={onClose}>
            <ProposalInfo ceramicProposal={ceramicProposal} />
            <TemplateInfo showQuote template={template} />
        </BaseLayerModal>
    )
}

export default AgreementInfoModal
