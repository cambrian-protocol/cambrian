import BaseLayerModal from '../../../components/modals/BaseLayerModal'
import HeaderTextSection from '../../../components/sections/HeaderTextSection'
import { OutcomeModel } from '@cambrian/app/models/OutcomeModel'
import { Box } from 'grommet'
import BaseFormGroupContainer from '@cambrian/app/components/containers/BaseFormGroupContainer'
import ModalHeader from '@cambrian/app/components/layout/header/ModalHeader'
import { TreeStructure } from 'phosphor-react'

interface OutcomeDetailModalProps {
    outcome: OutcomeModel
    onClose: () => void
}

const OutcomeDetailModal = ({ onClose, outcome }: OutcomeDetailModalProps) => {
    return (
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
                    <HeaderTextSection
                        size="small"
                        paragraph={outcome.context}
                    />
                </BaseFormGroupContainer>
            </Box>
            <Box pad="small" />
        </BaseLayerModal>
    )
}

export default OutcomeDetailModal
