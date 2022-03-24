import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import { Box } from 'grommet'
import HeaderTextSection from '@cambrian/app/src/components/sections/HeaderTextSection'
import SelectRecipientAllocationForm from '../forms/SelectRecipientAllocationForm'

type CreateRecipientAllocationModalProps = {
    onBack: () => void
    onClose: () => void
}

const SelectRecipientAllocationModal = ({
    onClose,
    onBack,
}: CreateRecipientAllocationModalProps) => (
    <BaseLayerModal onBack={onBack}>
        <HeaderTextSection
            title="Select recipient with amount"
            subTitle="Choose an existing address"
            paragraph="This recipient can redeem tokens for Solver funds when an outcome collection allocated to them occurs."
        />
        <Box fill>
            <SelectRecipientAllocationForm onClose={onClose} />
        </Box>
    </BaseLayerModal>
)

export default SelectRecipientAllocationModal
