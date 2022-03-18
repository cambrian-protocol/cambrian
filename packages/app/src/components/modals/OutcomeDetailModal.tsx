import BaseLayerModal from './BaseLayerModal'
import HeaderTextSection from '../sections/HeaderTextSection'
import { OutcomeModel } from '@cambrian/app/models/OutcomeModel'

interface OutcomeDetailModalProps {
    outcome: OutcomeModel
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
