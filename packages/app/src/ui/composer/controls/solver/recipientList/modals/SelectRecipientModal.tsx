import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import { Box } from 'grommet'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import SelectRecipientForm from '../forms/SelectRecipientForm'

interface SelectRecipientModalProps {
    onClose: () => void
    onBack: () => void
}

const SelectRecipientModal = ({
    onBack,
    onClose,
}: SelectRecipientModalProps) => {
    return (
        <BaseLayerModal onBack={onBack}>
            <HeaderTextSection
                title="Select recipient"
                subTitle="Choose an existing address from your solution"
            />
            <Box fill>
                <SelectRecipientForm onClose={onClose} />
            </Box>
        </BaseLayerModal>
    )
}

export default SelectRecipientModal
