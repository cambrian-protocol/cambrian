import { Box, Heading, Text } from 'grommet'

import BaseLayerModal from '../../../components/modals/BaseLayerModal'
import ModalHeader from '@cambrian/app/components/layout/header/ModalHeader'
import { OutcomeModel } from '@cambrian/app/models/OutcomeModel'

interface OutcomeInfoModalProps {
    outcome: OutcomeModel
    onClose: () => void
}

const OutcomeInfoModal = ({ onClose, outcome }: OutcomeInfoModalProps) => (
    <BaseLayerModal onClose={onClose}>
        <ModalHeader
            metaInfo="Outcome details"
            title={outcome.title}
            description={'Description and context of this Outcome.'}
        />
        <Box gap="medium" height={{ min: 'auto' }}>
            <Box gap="small" height={{ min: 'small' }}>
                <Heading level="4">Description</Heading>
                <Text
                    color="dark-4"
                    size="small"
                    style={{
                        whiteSpace: 'pre-line',
                        wordBreak: 'break-word',
                    }}
                >
                    {outcome.description}
                </Text>
            </Box>
            {outcome.context.length > 0 && (
                <Box gap="small">
                    <Heading level="4">Context</Heading>
                    <Text
                        color="dark-4"
                        size="xsmall"
                        style={{
                            whiteSpace: 'pre-line',
                            wordBreak: 'break-word',
                        }}
                    >
                        {outcome.context}
                    </Text>
                </Box>
            )}
        </Box>
        <Box pad="small" />
    </BaseLayerModal>
)

export default OutcomeInfoModal
