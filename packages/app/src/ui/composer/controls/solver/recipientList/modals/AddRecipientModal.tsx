import { Cursor, UserPlus } from 'phosphor-react'

import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import BaseMenuListItem from '@cambrian/app/components/buttons/BaseMenuListItem'
import { Box } from 'grommet'
import CreateRecipientForm from '../forms/CreateRecipientForm'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import SelectRecipientForm from '../forms/SelectRecipientForm'
import { useState } from 'react'

type AddRecipientModalProps = {
    onClose: () => void
}

const AddRecipientModal = ({ onClose }: AddRecipientModalProps) => {
    const [showCreateRecipient, setShowCreateRecipient] = useState(false)
    const [showSelectRecipient, setShowSelectRecipient] = useState(false)

    const toggleShowCreateRecipient = () =>
        setShowCreateRecipient(!showCreateRecipient)

    const toggleShowSelectRecipient = () =>
        setShowSelectRecipient(!showSelectRecipient)

    return (
        <>
            <BaseLayerModal onBack={onClose}>
                <HeaderTextSection
                    title="Add recipient"
                    subTitle="Who else deserves a share?"
                    paragraph="You can choose between existent recipients and solvers, or create a new ones"
                />
                <Box gap="small" fill>
                    <BaseMenuListItem
                        title="Select recipient"
                        icon={<Cursor size="24" />}
                        onClick={toggleShowSelectRecipient}
                    />
                    <BaseMenuListItem
                        title="Create recipient"
                        icon={<UserPlus size="24" />}
                        onClick={toggleShowCreateRecipient}
                    />
                </Box>
            </BaseLayerModal>
            {showCreateRecipient && (
                <BaseLayerModal onClose={toggleShowCreateRecipient}>
                    <CreateRecipientForm onClose={onClose} />
                </BaseLayerModal>
            )}
            {showSelectRecipient && (
                <BaseLayerModal onClose={toggleShowSelectRecipient}>
                    <SelectRecipientForm onClose={onClose} />
                </BaseLayerModal>
            )}
        </>
    )
}

export default AddRecipientModal
