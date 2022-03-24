import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import { Box } from 'grommet'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import SlotTagForm from '../forms/SlotTagForm'

interface SlotTagModalProps {
    slotId: string
    onBack: () => void
}

const SlotTagModal = ({ onBack, slotId }: SlotTagModalProps) => (
    <BaseLayerModal onBack={onBack}>
        <HeaderTextSection
            title="Edit Tag"
            paragraph="Define some Metadata that everybody knows what they are dealing with"
        />
        <Box fill>
            <SlotTagForm slotId={slotId} onClose={onBack} />
        </Box>
    </BaseLayerModal>
)

export default SlotTagModal
