import { Box, FormExtendedEvent } from 'grommet'
import RecipientConfigForm, {
    RecipientFormType,
    initialRecipientConfigFormInput,
} from './RecipientConfigForm'

import { Button } from 'grommet'
import HeaderTextSection from '@cambrian/app/src/components/sections/HeaderTextSection'
import { SlotTagFormInputType } from '../../general/forms/SlotTagForm'
import SlotTagModal from '../../general/modals/SlotTagModal'
import { initialSlotTagInput } from '../../slotList/modals/CreateSlotModal'
import { useComposerContext } from '@cambrian/app/src/store/composer/composer.context'
import { useState } from 'react'

type CreateRecipientFormProps = {
    onClose: () => void
}

const CreateRecipientForm = ({ onClose }: CreateRecipientFormProps) => {
    const { dispatch } = useComposerContext()

    const [slotTagInput, setSlotTagInput] =
        useState<SlotTagFormInputType>(initialSlotTagInput)

    const [input, setInput] = useState<RecipientFormType>(
        initialRecipientConfigFormInput
    )

    const [showTagModal, setShowTagModal] = useState(false)
    const toggleShowTagModal = () => setShowTagModal(!showTagModal)

    const onSubmit = (event: FormExtendedEvent<RecipientFormType, Element>) => {
        event.preventDefault()
        dispatch({
            type: 'CREATE_RECIPIENT',
            payload: { recipientData: input, slotTag: slotTagInput },
        })
        onClose()
    }

    return (
        <>
            <HeaderTextSection
                title="Create new recipient"
                subTitle="Who else deserves a share?"
                paragraph="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel erat et enim blandit pharetra."
            />
            <Box fill>
                <Button secondary onClick={toggleShowTagModal} label="Tag" />
                <RecipientConfigForm
                    onSubmit={onSubmit}
                    setRecipientInput={setInput}
                    recipientInput={input}
                    submitLabel="Create"
                />
            </Box>
            {showTagModal && (
                <SlotTagModal
                    onBack={toggleShowTagModal}
                    slotTagInput={slotTagInput}
                    setSlotTagInput={setSlotTagInput}
                />
            )}
        </>
    )
}

export default CreateRecipientForm
