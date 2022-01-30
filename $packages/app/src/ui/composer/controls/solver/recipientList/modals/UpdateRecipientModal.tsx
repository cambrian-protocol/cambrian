import { Box, FormExtendedEvent } from 'grommet'
import { useEffect, useState } from 'react'

import BaseModal from '@cambrian/app/components/modals/BaseModal'
import { FloppyDisk } from 'phosphor-react'
import HeaderTextSection from '@cambrian/app/src/components/sections/HeaderTextSection'
import RecipientConfigForm from '../forms/RecipientConfigForm'
import { RecipientFormType } from '../forms/CreateRecipientForm'
import { SlotModel } from '@cambrian/app/models/SlotModel'
import { useComposerContext } from '@cambrian/app/src/store/composer/composer.context'

interface UpdateRecipientModalProps {
    onClose: () => void
    recipientModel: SlotModel
}

const UpdateRecipientModal = ({
    onClose,
    recipientModel,
}: UpdateRecipientModalProps) => {
    const { dispatch } = useComposerContext()

    const [input, setInput] = useState<RecipientFormType>({
        address: '',
        description: '',
    })

    useEffect(() => {
        //Init
        if (recipientModel.data.length === 1) {
            setInput({
                address: recipientModel.data[0].toString(),
                description:
                    recipientModel.description !== undefined &&
                    recipientModel.description !== null
                        ? recipientModel.description
                        : '',
            })
        }
    }, [])

    const onSubmit = (event: FormExtendedEvent<RecipientFormType, Element>) => {
        event.preventDefault()

        dispatch({
            type: 'UPDATE_RECIPIENT',
            payload: {
                slotId: recipientModel.id,
                recipientData: input,
            },
        })
        onClose()
    }

    return (
        <BaseModal onClose={onClose}>
            <Box gap="small">
                <HeaderTextSection
                    title="Edit recipient"
                    subTitle="Changed your mind?"
                    paragraph="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel erat et enim blandit pharetra."
                />
                <RecipientConfigForm
                    onSubmit={onSubmit}
                    setRecipientInput={setInput}
                    recipientInput={input}
                    submitIcon={<FloppyDisk />}
                    submitLabel="Save"
                />
            </Box>
        </BaseModal>
    )
}

export default UpdateRecipientModal
