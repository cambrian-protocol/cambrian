import BaseLayerModal from './BaseLayerModal'
import HeaderTextSection from '../sections/HeaderTextSection'
import { IPFSOutcomeModel } from '@cambrian/app/models/SolverModel'

interface OutcomeDetailModalProps {
    outcome: IPFSOutcomeModel
    onClose: () => void
}

const OutcomeDetailModal = ({ onClose, outcome }: OutcomeDetailModalProps) => {
    return (
        <BaseLayerModal onClose={onClose}>
            <HeaderTextSection
                title={outcome.title}
                subTitle={'Outcome Detail'}
                paragraph={outcome.description}
            />
            <HeaderTextSection
                subTitle={'Context'}
                paragraph={outcome.context}
            />
        </BaseLayerModal>
    )
}

export default OutcomeDetailModal
