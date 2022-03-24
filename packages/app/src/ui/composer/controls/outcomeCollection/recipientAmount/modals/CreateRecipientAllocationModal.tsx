import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import { Box } from 'grommet'
import CreateRecipientAllocationForm from '../forms/CreateRecipientAllocationForm'
import HeaderTextSection from '@cambrian/app/src/components/sections/HeaderTextSection'

type CreateRecipientAllocationModalProps = {
    onBack: () => void
    onClose: () => void
}

const CreateRecipientAllocationModal = ({
    onClose,
    onBack,
}: CreateRecipientAllocationModalProps) => (
    <BaseLayerModal onBack={onBack}>
        <HeaderTextSection
            title="Create new recipient"
            subTitle="Who else deserves a share?"
            paragraph="They will receive conditional tokens when included in an outcome collection."
        />
        <Box fill>
            <CreateRecipientAllocationForm onClose={onClose} />
        </Box>
    </BaseLayerModal>
)

export default CreateRecipientAllocationModal
