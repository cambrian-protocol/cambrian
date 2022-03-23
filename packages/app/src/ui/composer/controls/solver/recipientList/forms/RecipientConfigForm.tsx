import { Box, Button, Form, FormExtendedEvent, FormField } from 'grommet'
import { SetStateAction, useState } from 'react'

import BaseFormContainer from '@cambrian/app/components/containers/BaseFormContainer'
import BaseMenuListItem from '@cambrian/app/components/buttons/BaseMenuListItem'
import { SlotTagFormInputType } from '../../general/forms/SlotTagForm'
import SlotTagModal from '../../general/modals/SlotTagModal'
import { Tag } from 'phosphor-react'

interface RecipientConfigFormProps {
    onSubmit: (event: FormExtendedEvent<RecipientFormType, Element>) => void
    recipientInput: RecipientFormType
    setRecipientInput: React.Dispatch<SetStateAction<RecipientFormType>>
    recipientTagInput: SlotTagFormInputType
    setRecipientTagInput: React.Dispatch<SetStateAction<SlotTagFormInputType>>
    submitLabel: string
}

export const initialRecipientConfigFormInput = {
    address: '',
}

export type RecipientFormType = {
    address: string
}

const RecipientConfigForm = ({
    onSubmit,
    recipientInput,
    setRecipientInput,
    submitLabel,
    recipientTagInput,
    setRecipientTagInput,
}: RecipientConfigFormProps) => {
    const [showSlotTagModal, setShowSlotTagModal] = useState(false)
    const toggleShowSlotTagModal = () => setShowSlotTagModal(!showSlotTagModal)
    return (
        <>
            <BaseFormContainer gap="medium">
                <BaseMenuListItem
                    subTitle="Define a label, a description and more..."
                    title="Tag"
                    icon={<Tag />}
                    onClick={toggleShowSlotTagModal}
                />
                <Form<RecipientFormType>
                    value={recipientInput}
                    onSubmit={(event) => onSubmit(event)}
                    onChange={(nextValue: RecipientFormType) => {
                        setRecipientInput(nextValue)
                    }}
                >
                    <FormField name="address" label="Address" />
                    <Box>
                        <Button primary type="submit" label={submitLabel} />
                    </Box>
                </Form>
            </BaseFormContainer>
            {showSlotTagModal && (
                <SlotTagModal
                    onBack={toggleShowSlotTagModal}
                    slotTagInput={recipientTagInput}
                    onSubmit={(slotTag: SlotTagFormInputType) => {
                        setRecipientTagInput(slotTag)
                    }}
                />
            )}
        </>
    )
}

export default RecipientConfigForm
