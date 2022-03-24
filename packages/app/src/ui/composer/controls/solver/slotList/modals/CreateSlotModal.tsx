import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import { Box } from 'grommet'
import CreateSlotForm from '../forms/CreateSlotForm'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import React from 'react'
import _uniqueId from 'lodash/uniqueId'

type CreateSlotModalProps = {
    onClose: () => void
}

const CreateSlotModal = ({ onClose }: CreateSlotModalProps) => (
    <BaseLayerModal onClose={onClose}>
        <HeaderTextSection
            title="Create new Slot"
            subTitle="Manual slot configuration"
            paragraph="Create a new slot which provides data to this Solver during runtime. If you don't know, you can ignore this."
        />
        <Box fill>
            <CreateSlotForm onClose={onClose} />
        </Box>
    </BaseLayerModal>
)

export default CreateSlotModal
