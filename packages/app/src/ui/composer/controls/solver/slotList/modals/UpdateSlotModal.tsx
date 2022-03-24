import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import { Box } from 'grommet'
import { ComposerSlotModel } from '@cambrian/app/models/SlotModel'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import UpdateSlotForm from '../forms/UpdateSlotForm'
import _uniqueId from 'lodash/uniqueId'

type UpdateSlotFormModalProps = {
    slotModel: ComposerSlotModel
    onClose: () => void
}

const UpdateSlotModal = ({ onClose, slotModel }: UpdateSlotFormModalProps) => (
    <BaseLayerModal onClose={onClose}>
        <HeaderTextSection
            subTitle={`Slot ID: ${slotModel.id}`}
            title="Edit Slot"
            paragraph="Update the slot which provides data to this Solver during runtime. If you don't know, you can ignore this."
        />
        <Box fill>
            <UpdateSlotForm slot={slotModel} onClose={onClose} />
        </Box>
    </BaseLayerModal>
)

export default UpdateSlotModal
