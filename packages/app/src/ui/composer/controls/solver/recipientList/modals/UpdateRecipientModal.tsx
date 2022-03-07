import { Box, FormExtendedEvent } from 'grommet'
import { useEffect, useState } from 'react'

import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import { ComposerSlotModel } from '@cambrian/app/models/SlotModel'
import HeaderTextSection from '@cambrian/app/src/components/sections/HeaderTextSection'
import RecipientConfigForm from '../forms/RecipientConfigForm'
import { RecipientFormType } from '../forms/CreateRecipientForm'
import { useComposerContext } from '@cambrian/app/src/store/composer/composer.context'

interface UpdateRecipientModalProps {
    onClose: () => void
    recipientModel: ComposerSlotModel
}

const UpdateRecipientModal = ({
    onClose,
    recipientModel,
}: UpdateRecipientModalProps) => {
    const { dispatch } = useComposerContext()

    const [input, setInput] = useState<RecipientFormType>({
        address: '',
        label: '',
        description: '',
    })

    useEffect(() => {
        //Init
        if (recipientModel.data.length === 1) {
            setInput({
                address: recipientModel.data[0].toString(),
                label: recipientModel.tag.label,
                description: recipientModel.tag.description,
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
        <BaseLayerModal onBack={onClose}>
            <HeaderTextSection
                title="Edit recipient"
                subTitle="Changed your mind?"
                paragraph="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel erat et enim blandit pharetra."
            />
            <Box fill>
                <RecipientConfigForm
                    onSubmit={onSubmit}
                    setRecipientInput={setInput}
                    recipientInput={input}
                    submitLabel="Save"
                />
            </Box>
        </BaseLayerModal>
    )
}

export default UpdateRecipientModal
