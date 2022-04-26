import BaseLayerModal from './BaseLayerModal'
import { Box } from 'grommet'
import HeaderTextSection from '../sections/HeaderTextSection'
import { MetadataModel } from '@cambrian/app/models/MetadataModel'
import ProposalContextHeader from '@cambrian/app/ui/proposals/ProposalContextHeader'
import { ProposalModel } from '@cambrian/app/models/ProposalModel'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'

interface ProposalInfoModalProps {
    onClose: () => void
    metadata: MetadataModel
}

const ProposalInfoModal = ({ onClose, metadata }: ProposalInfoModalProps) => {
    return (
        <BaseLayerModal onClose={onClose}>
            <Box fill>
                <HeaderTextSection
                    subTitle="Information"
                    title="About this Gig"
                />
                <ProposalContextHeader
                    proposal={metadata?.stages?.proposal as ProposalModel}
                    template={metadata?.stages?.template as TemplateModel}
                />
            </Box>
        </BaseLayerModal>
    )
}

export default ProposalInfoModal
