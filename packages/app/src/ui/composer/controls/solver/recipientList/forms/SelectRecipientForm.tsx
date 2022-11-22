import { Button, Form, FormExtendedEvent } from 'grommet'
import SelectRecipient, {
    SelectRecipientType,
} from '@cambrian/app/components/selects/SelectRecipient'

import BaseFormContainer from '@cambrian/app/components/containers/BaseFormContainer'
import BaseFormGroupContainer from '@cambrian/app/components/containers/BaseFormGroupContainer'
import SlotTagFormFields from '../../general/forms/SlotTagFormFields'
import { SlotTagModel } from '@cambrian/app/src/classes/Tags/SlotTag'
import { defaultSlotTagValues } from '@cambrian/app/classes/Tags/SlotTag'
import { useComposerContext } from '@cambrian/app/src/store/composer/composer.context'
import { useState } from 'react'

type SelectRecipientFormProps = {
    onClose: () => void
}

export type SelectedRecipientFormType = SlotTagModel & SelectRecipientType

const initialSelectedRecipientFormInput = {
    ...defaultSlotTagValues,
    title: '',
}

const SelectRecipientForm = ({ onClose }: SelectRecipientFormProps) => {
    const { dispatch } = useComposerContext()

    const [input, setInput] = useState<SelectedRecipientFormType>(
        initialSelectedRecipientFormInput
    )

    const onSubmit = (event: FormExtendedEvent<SlotTagModel, Element>) => {
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
