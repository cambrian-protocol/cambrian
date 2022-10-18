import BaseFormGroupContainer from '@cambrian/app/components/containers/BaseFormGroupContainer'
import BaseLayerModal from '../../../components/modals/BaseLayerModal'
import { Box } from 'grommet'
import HeaderTextSection from '../../../components/sections/HeaderTextSection'
import ModalHeader from '@cambrian/app/components/layout/header/ModalHeader'
import { OutcomeModel } from '@cambrian/app/models/OutcomeModel'
import { TreeStructure } from 'phosphor-react'

interface OutcomeInfoModalProps {
    outcome: OutcomeModel
    onClose: () => void
}

const OutcomeInfoModal = ({ onClose, outcome }: OutcomeInfoModalProps) => (
    <BaseLayerModal onClose={onClose}>
        <ModalHeader
            metaInfo="Outcome"
            icon={<TreeStructure />}
            title={outcome.title}
            description={'Definition and context of this Outcome.'}
        />
        <Box gap="medium">
            <BaseFormGroupContainer groupTitle="Description" border>
                <HeaderTextSection
                    size="small"
                    paragraph={outcome.description}
                />
            </BaseFormGroupContainer>
            <BaseFormGroupContainer groupTitle="Context">
                <HeaderTextSection size="small" paragraph={outcome.context} />
            </BaseFormGroupContainer>
        </Box>
        <Box pad="small" />
    </BaseLayerModal>
)

export default OutcomeInfoModal
