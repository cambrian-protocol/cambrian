import { Button, Form, FormExtendedEvent, FormField } from 'grommet'
import SelectRecipient, {
    SelectRecipientType,
} from '@cambrian/app/components/selects/SelectRecipient'
import SlotTagFormFields, {
    SlotTagFormFieldsType,
    initialSlotTagInput,
} from '../../general/forms/SlotTagFormFields'

import BaseFormContainer from '@cambrian/app/components/containers/BaseFormContainer'
import BaseFormGroupContainer from '@cambrian/app/components/containers/BaseFormGroupContainer'
import { useComposerContext } from '@cambrian/app/src/store/composer/composer.context'
import { useState } from 'react'

type SelectRecipientFormProps = {
    onClose: () => void
}

export type SelectedRecipientFormType = SlotTagFormFieldsType &
    SelectRecipientType

const initialSelectedRecipientFormInput = {
    ...initialSlotTagInput,
    title: '',
}

const SelectRecipientForm = ({ onClose }: SelectRecipientFormProps) => {
    const { dispatch } = useComposerContext()

    const [input, setInput] = useState<SelectedRecipientFormType>(
        initialSelectedRecipientFormInput
    )

    const onSubmit = (
        event: FormExtendedEvent<SlotTagFormFieldsType, Element>
    ) => {
        event.preventDefault()
        dispatch({
            type: 'ADD_RECIPIENT',
            payload: input,
        })
        onClose()
    }

    return (
        <Form<SelectedRecipientFormType>
            onSubmit={(event) => onSubmit(event)}
            value={input}
            onChange={(nextValue: SelectedRecipientFormType) => {
                setInput(nextValue)
            }}
        >
            <BaseFormContainer>
                <SlotTagFormFields />
                <BaseFormGroupContainer>
                    <SelectRecipient />
                </BaseFormGroupContainer>
                <Button primary type="submit" label="Add recipient" />
            </BaseFormContainer>
        </Form>
    )
}

export default SelectRecipientForm
