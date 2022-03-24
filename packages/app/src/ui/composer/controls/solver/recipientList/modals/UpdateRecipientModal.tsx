import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import { Box } from 'grommet'
import { ComposerSlotModel } from '@cambrian/app/models/SlotModel'
import HeaderTextSection from '@cambrian/app/src/components/sections/HeaderTextSection'
import UpdateRecipientForm from '../forms/UpdateRecipientForm'

interface UpdateRecipientModalProps {
    onClose: () => void
    recipientSlot: ComposerSlotModel
}

const UpdateRecipientModal = ({
    onClose,
    recipientSlot,
}: UpdateRecipientModalProps) => (
    <BaseLayerModal onBack={onClose}>
        <HeaderTextSection
            title="Edit recipient"
            subTitle="Changed your mind?"
            paragraph="Edit the new address for this recipient."
        />
        <Box fill>
            <UpdateRecipientForm onClose={onClose} recipient={recipientSlot} />
        </Box>
    </BaseLayerModal>
)

export default UpdateRecipientModal
