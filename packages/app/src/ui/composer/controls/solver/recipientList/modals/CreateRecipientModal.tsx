import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import { Box } from 'grommet'
import CreateRecipientForm from '../forms/CreateRecipientForm'
import HeaderTextSection from '@cambrian/app/src/components/sections/HeaderTextSection'

type CreateRecipientModalProps = {
    onBack: () => void
    onClose: () => void
}

const CreateRecipientModal = ({
    onClose,
    onBack,
}: CreateRecipientModalProps) => {
    return (
        <BaseLayerModal onBack={onBack}>
            <HeaderTextSection
                title="Create new recipient"
                subTitle="Who else deserves a share?"
                paragraph="They will receive conditional tokens when included in an outcome collection."
            />
            <Box fill>
                <CreateRecipientForm onClose={onClose} />
            </Box>
        </BaseLayerModal>
    )
}

export default CreateRecipientModal
