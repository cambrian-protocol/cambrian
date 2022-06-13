import BaseLayerModal from '../../../components/modals/BaseLayerModal'
import { Box } from 'grommet'
import HeaderTextSection from '../../../components/sections/HeaderTextSection'
import { ProposalModel } from '@cambrian/app/models/ProposalModel'
import ProposalTemplateInfoComponent from '@cambrian/app/ui/proposals/ProposalTemplateInfoComponent'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'

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
            <Box fill>
                <HeaderTextSection
                    subTitle="Information"
                    title="About this Gig"
                />
                <ProposalTemplateInfoComponent
                    proposalMetadata={proposalMetadata}
                    templateMetadata={templateMetadata}
                />
                <Box pad="medium" />
            </Box>
        </BaseLayerModal>
    )
}

export default ProposalInfoModal
