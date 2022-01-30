import { Box, Button } from 'grommet'
import { Cursor, UserPlus } from 'phosphor-react'

import BaseModal from '@cambrian/app/src/components/modals/BaseModal'
import CreateRecipientForm from '../forms/CreateRecipientForm'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import SelectRecipientForm from '../forms/SelectRecipientForm'
import { useState } from 'react'

type AddRecipientModalProps = {
    onClose: () => void
}

type AddRecipientControllerType =
    | 'MainControl'
    | 'CreateRecipientControl'
    | 'SelectRecipientControl'

const AddRecipientModal = ({ onClose }: AddRecipientModalProps) => {
    const [controller, setController] =
        useState<AddRecipientControllerType>('MainControl')

    function renderControl() {
        switch (controller) {
            case 'CreateRecipientControl':
                return <CreateRecipientForm onClose={onClose} />
            case 'SelectRecipientControl':
                return <SelectRecipientForm onClose={onClose} />
            default:
                return <></>
        }
    }

    return (
        <BaseModal onClose={onClose}>
            {controller === 'MainControl' ? (
                <Box gap="small">
                    <HeaderTextSection
                        title="Add recipient"
                        subTitle="Who else deserves a share?"
                        paragraph="You can choose between existent recipients and solvers, or create a new ones"
                    />
                    <Button
                        primary
                        label="Select recipient"
                        icon={<Cursor size="24" />}
                        onClick={() => setController('SelectRecipientControl')}
                    />
                    <Button
                        primary
                        label="Create recipient"
                        icon={<UserPlus size="24" />}
                        onClick={() => setController('CreateRecipientControl')}
                    />
                </Box>
            ) : (
                renderControl()
            )}
        </BaseModal>
    )
}

export default AddRecipientModal
