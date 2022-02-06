import BaseLayerModal from './BaseLayerModal'
import HeaderTextSection from '../sections/HeaderTextSection'
import { OutcomeModel } from '@cambrian/app/models/ConditionModel'

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
            <HeaderTextSection subTitle={'URI'} paragraph={outcome.uri} />
            <HeaderTextSection
                subTitle={'Context'}
                paragraph={outcome.context}
            />
        </BaseLayerModal>
    )
}

export default OutcomeDetailModal
