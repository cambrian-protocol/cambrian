import BaseLayerModal from '../../../components/modals/BaseLayerModal'
import { ProposalModel } from '@cambrian/app/models/ProposalModel'
import ProposalTemplateInfoComponent from '@cambrian/app/ui/proposals/ProposalTemplateInfoComponent'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import ModalHeader from '@cambrian/app/components/layout/header/ModalHeader'
import { Handshake } from 'phosphor-react'

interface ProposalInfoModalProps {
    onClose: () => void
    proposalMetadata?: ProposalModel
    templateMetadata?: TemplateModel
}

const ProposalInfoModal = ({
    onClose,
    proposalMetadata,
    templateMetadata,
}: ProposalInfoModalProps) => {
    return (
        <BaseLayerModal onClose={onClose}>
            <ModalHeader
                title="Agreement Details"
                description="The following proposal and temlate has been agreed on."
                icon={<Handshake />}
            />
            <ProposalTemplateInfoComponent
                proposalMetadata={proposalMetadata}
                templateMetadata={templateMetadata}
            />
        </BaseLayerModal>
    )
}

export default ProposalInfoModal
