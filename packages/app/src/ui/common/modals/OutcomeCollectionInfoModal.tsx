import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import ModalHeader from '@cambrian/app/components/layout/header/ModalHeader'
import { OutcomeCollectionModel } from '@cambrian/app/models/OutcomeCollectionModel'
import OutcomeReportOverview from '../../solver/OutcomeReportOverview'
import { TokenModel } from '@cambrian/app/models/TokenModel'

interface OutcomeCollectionInfoModalProps {
    proposedOutcome: OutcomeCollectionModel
    collateralToken: TokenModel
    onClose: () => void
    confirmedOutcome?: OutcomeCollectionModel
}

const OutcomeCollectionInfoModal = ({
    proposedOutcome,
    collateralToken,
    confirmedOutcome,
    onClose,
}: OutcomeCollectionInfoModalProps) => (
    <BaseLayerModal onClose={onClose} width="xlarge">
        <ModalHeader
            title="Outcome report"
            description="The following outcome has been reported by the Keeper TODO"
        />
        <OutcomeReportOverview
            proposedOutcome={proposedOutcome}
            confirmedOutcome={confirmedOutcome}
            collateralToken={collateralToken}
        />
    </BaseLayerModal>
)

export default OutcomeCollectionInfoModal
