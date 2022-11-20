import { Button, Form, FormExtendedEvent } from 'grommet'
import SelectOrCreateAmount, {
    SelectAmountDataType,
    initialSelectAmountInput,
} from '@cambrian/app/components/selects/SelectOrCreateAmount'
import SelectRecipient, {
    SelectRecipientType,
    initialSelectRecipientInput,
} from '@cambrian/app/components/selects/SelectRecipient'
import SlotTagFormFields, {
    SlotTagModel,
    initialSlotTagInput,
} from '../../../solver/general/forms/SlotTagFormFields'

import BaseFormContainer from '@cambrian/app/components/containers/BaseFormContainer'
import BaseFormGroupContainer from '@cambrian/app/components/containers/BaseFormGroupContainer'
import { ComposerSlotModel } from '@cambrian/app/models/SlotModel'
import { useComposerContext } from '@cambrian/app/src/store/composer/composer.context'
import { useState } from 'react'

type SelectRecipientAllocationFormProps = {
    onClose: () => void
}
export type SelectRecipientAllocationFormType = SlotTagModel &
    SelectRecipientType & {
        selectedAmount: SelectAmountDataType
    }

export const initialSelectRecipientAllocationFormInput: SelectRecipientAllocationFormType =
    {
        ...initialSelectRecipientInput,
        ...initialSlotTagInput,
        selectedAmount: initialSelectAmountInput,
    }

const SelectRecipientAllocationForm = ({
    onClose,
}: SelectRecipientAllocationFormProps) => {
    const { dispatch } = useComposerContext()

    const [input, setInput] = useState<SelectRecipientAllocationFormType>(
        initialSelectRecipientAllocationFormInput
    )

    const handleUpdateSelectedAmount = (amount: SelectAmountDataType) => {
        setInput((prev) => {
            return { ...prev, selectedAmount: amount }
        })
    }

    const onSubmit = (event: FormExtendedEvent<{}, Element>) => {
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
            dispatch({
                type: 'ADD_RECIPIENT_WITH_ALLOCATION',
                payload: { ...input, amount: amountToDispatch },
            })
            onClose()
        } else {
            console.error('Amount must be numeric!')
        }
    }

    return (
        <Form<SelectRecipientAllocationFormType>
            onSubmit={(event) => onSubmit(event)}
            onChange={(nextValue: SelectRecipientAllocationFormType) => {
                setInput((prev) => {
                    return {
                        ...prev,
                        ...nextValue,
                    }
                })
            }}
        >
            <BaseFormContainer>
                <SlotTagFormFields />
                <BaseFormGroupContainer>
                    <SelectRecipient />
                </BaseFormGroupContainer>
                <BaseFormGroupContainer>
                    <SelectOrCreateAmount
                        amountData={input.selectedAmount}
                        updateSelectedAmount={handleUpdateSelectedAmount}
                    />
                </BaseFormGroupContainer>
                <Button primary type="submit" label="Add recipient" />
            </BaseFormContainer>
        </Form>
    )
}

export default SelectRecipientAllocationForm
