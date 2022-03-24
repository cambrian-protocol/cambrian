import {
    CreateRecipientFormType,
    initialCreateRecipientFormInput,
} from '../../../solver/recipientList/forms/CreateRecipientForm'
import SelectOrCreateAmount, {
    SelectAmountDataType,
    initialSelectAmountInput,
} from '@cambrian/app/components/selects/SelectOrCreateAmount'

import BaseFormContainer from '@cambrian/app/components/containers/BaseFormContainer'
import BaseFormGroupContainer from '@cambrian/app/components/containers/BaseFormGroupContainer'
import { Button } from 'grommet'
import { ComposerSlotModel } from '@cambrian/app/models/SlotModel'
import { Form } from 'grommet'
import { FormExtendedEvent } from 'grommet'
import { FormField } from 'grommet'
import SlotTagFormFields from '../../../solver/general/forms/SlotTagFormFields'
import { useComposerContext } from '@cambrian/app/store/composer/composer.context'
import { useState } from 'react'

interface CreateRecipientAllocationFormProps {
    onClose: () => void
}

export type CreateRecipientAllocationFormType = CreateRecipientFormType & {
    selectedAmount: SelectAmountDataType
}

const initialCreateRecipientAllocationFormInput: CreateRecipientAllocationFormType =
    {
        ...initialCreateRecipientFormInput,
        selectedAmount: initialSelectAmountInput,
    }

// TODO UX Improvement: Add checkbox if slot should be filled from keeper when solve gets prepared. => create manual slot instead of constant
const CreateRecipientAllocationForm = ({
    onClose,
}: CreateRecipientAllocationFormProps) => {
    const { dispatch } = useComposerContext()

    const [input, setInput] = useState<CreateRecipientAllocationFormType>(
        initialCreateRecipientAllocationFormInput
    )

    const onSubmit = (
        event: FormExtendedEvent<CreateRecipientAllocationFormType, Element>
    ) => {
        event.preventDefault()
        // Parsing input to Number
        let amountToDispatch: ComposerSlotModel | number | undefined

        if (input.selectedAmount.slotModel) {
            amountToDispatch = input.selectedAmount.slotModel
        } else {
            const parsedAmount = parseInt(input.selectedAmount.amount)
            if (!isNaN(parsedAmount)) {
                amountToDispatch = parsedAmount
            }
        }

        if (amountToDispatch !== undefined) {
            onClose()
            dispatch({
                type: 'CREATE_RECIPIENT_WITH_ALLOCATION',
                payload: { ...input, amount: amountToDispatch },
            })
            onClose()
        } else {
            console.error('Amount must be numeric!')
        }
    }

    const handleUpdateSelectedAmount = (amount: SelectAmountDataType) => {
        setInput((prev) => {
            return { ...prev, selectedAmount: amount }
        })
    }

    return (
        <Form<CreateRecipientAllocationFormType>
            value={input}
            onSubmit={(event) => onSubmit(event)}
            onChange={(nextValue: CreateRecipientAllocationFormType) => {
                setInput(nextValue)
            }}
        >
            <BaseFormContainer>
                <SlotTagFormFields />
                <BaseFormGroupContainer>
                    <FormField name="address" label="Address" />
                </BaseFormGroupContainer>
                <BaseFormGroupContainer>
                    <SelectOrCreateAmount
                        amountData={input.selectedAmount}
                        updateSelectedAmount={handleUpdateSelectedAmount}
                    />
                </BaseFormGroupContainer>
                <Button primary type="submit" label="Create Recipient" />
            </BaseFormContainer>
        </Form>
    )
}

export default CreateRecipientAllocationForm
