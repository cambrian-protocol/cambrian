import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import { Box } from 'grommet'
import { ComposerAllocationType } from '@cambrian/app/models/AllocationModel'
import HeaderTextSection from '@cambrian/app/src/components/sections/HeaderTextSection'
import UpdateRecipientAllocationForm from '../forms/UpdateRecipientAllocationForm'

type UpdateRecipientAllocationModalProps = {
    allocation: ComposerAllocationType
    onClose: () => void
}

const UpdateRecipientAllocationModal = ({
    onClose,
    allocation,
}: UpdateRecipientAllocationModalProps) => (
    <BaseLayerModal onClose={onClose}>
        <HeaderTextSection
            title="Define the share"
            subTitle="Choose an existing amount to save gas"
            paragraph="Amounts are denoted in Basis Points. 100 BPs = 1%"
        />
        <Box fill>
            <UpdateRecipientAllocationForm
                onClose={onClose}
                recipientAllocation={allocation}
            />
        </Box>
    </BaseLayerModal>
)

export default UpdateRecipientAllocationModal
