import { Button, Form, FormExtendedEvent, FormField } from 'grommet'
import SlotTagFormFields, {
    SlotTagFormFieldsType,
    initialSlotTagInput,
} from '../../general/forms/SlotTagFormFields'

import BaseFormContainer from '@cambrian/app/components/containers/BaseFormContainer'
import BaseFormGroupContainer from '@cambrian/app/components/containers/BaseFormGroupContainer'
import { useComposerContext } from '@cambrian/app/store/composer/composer.context'
import { useState } from 'react'

interface RecipientConfigFormProps {
    onClose: () => void
}

export const initialCreateRecipientFormInput = {
    ...initialSlotTagInput,
    address: '',
}

export type CreateRecipientFormType = SlotTagFormFieldsType & {
    address: string
}

// TODO UX Improvement: Add checkbox if slot should be filled from keeper when solve gets prepared. => create manual slot instead of constant
const CreateRecipientForm = ({ onClose }: RecipientConfigFormProps) => {
    const { dispatch } = useComposerContext()

    const [input, setInput] = useState<CreateRecipientFormType>(
        initialCreateRecipientFormInput
    )

    const onSubmit = (
        event: FormExtendedEvent<CreateRecipientFormType, Element>
    ) => {
        event.preventDefault()
        dispatch({
            type: 'CREATE_RECIPIENT',
            payload: input,
        })
        onClose()
    }

    return (
        <Form<CreateRecipientFormType>
            value={input}
            onSubmit={(event) => onSubmit(event)}
            onChange={(nextValue: CreateRecipientFormType) => {
                setInput(nextValue)
            }}
        >
            <BaseFormContainer>
                <SlotTagFormFields />
                <BaseFormGroupContainer>
                    <FormField name="address" label="Address" />
                </BaseFormGroupContainer>
                <Button primary type="submit" label="Create recipient" />
            </BaseFormContainer>
        </Form>
    )
}

export default CreateRecipientForm
