import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import { Box } from 'grommet'
import { DocumentModel } from '@cambrian/app/services/api/cambrian.api'
import ProposalBody from '../../proposals/ProposalBody'
import ProposalModalHeader from '@cambrian/app/components/layout/header/ProposalModalHeader'
import { ProposalModel } from '@cambrian/app/models/ProposalModel'
import { TokenModel } from '@cambrian/app/models/TokenModel'

interface ProposalInfoModalProps {
    onClose: () => void
    proposalDoc: DocumentModel<ProposalModel>
    collateralToken: TokenModel
}

const ProposalInfoModal = ({
    onClose,
    proposalDoc,
    collateralToken,
}: ProposalInfoModalProps) => (
    <BaseLayerModal onClose={onClose} width="xlarge">
        <Box height={{ min: 'auto' }} gap="medium">
            <ProposalModalHeader proposalDoc={proposalDoc} />
            <ProposalBody
                proposalContent={proposalDoc.content}
                collateralToken={collateralToken}
            />
        </Box>
    </BaseLayerModal>
)

export default ProposalInfoModal
