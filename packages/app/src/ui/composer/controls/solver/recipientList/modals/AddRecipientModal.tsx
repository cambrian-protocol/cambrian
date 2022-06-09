import { Cursor, UserPlus } from 'phosphor-react'

import BaseFormContainer from '@cambrian/app/components/containers/BaseFormContainer'
import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import BaseListItemButton from '@cambrian/app/components/buttons/BaseListItemButton'
import CreateRecipientModal from './CreateRecipientModal'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import SelectRecipientModal from './SelectRecipientModal'
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
                <BaseFormContainer>
                    <BaseListItemButton
                        title="Select recipient"
                        icon={<Cursor size="24" />}
                        onClick={toggleShowSelectRecipient}
                    />
                    <BaseListItemButton
                        title="Create recipient"
                        icon={<UserPlus size="24" />}
                        onClick={toggleShowCreateRecipient}
                    />
                </BaseFormContainer>
            </BaseLayerModal>
            {showCreateRecipient && (
                <CreateRecipientModal
                    onBack={toggleShowCreateRecipient}
                    onClose={onClose}
                />
            )}
            {showSelectRecipient && (
                <SelectRecipientModal
                    onBack={toggleShowSelectRecipient}
                    onClose={onClose}
                />
            )}
        </>
    )
}

export default AddRecipientModal
