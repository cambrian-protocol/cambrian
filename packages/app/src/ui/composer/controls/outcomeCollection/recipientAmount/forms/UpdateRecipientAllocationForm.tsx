import SelectOrCreateAmount, {
    SelectAmountDataType,
    initialSelectAmountInput,
} from '@cambrian/app/components/selects/SelectOrCreateAmount'
import { useEffect, useState } from 'react'

import BaseFormContainer from '@cambrian/app/components/containers/BaseFormContainer'
import BaseFormGroupContainer from '@cambrian/app/components/containers/BaseFormGroupContainer'
import { Button } from 'grommet'
import { ComposerAllocationType } from '@cambrian/app/models/AllocationModel'
import { ComposerSlotModel } from '@cambrian/app/models/SlotModel'
import { useComposerContext } from '@cambrian/app/store/composer/composer.context'

interface UpdateRecipientAllocationFormProps {
    onClose: () => void
    recipientAllocation: ComposerAllocationType
}

const UpdateRecipientAllocationForm = ({
    onClose,
    recipientAllocation,
}: UpdateRecipientAllocationFormProps) => {
    const { dispatch } = useComposerContext()
    const [input, setInput] = useState<SelectAmountDataType>(
        initialSelectAmountInput
    )

    // Init
    useEffect(() => {
        setInput({
            amount: recipientAllocation.amountModel.data.toString(),
            slotModel: recipientAllocation.amountModel,
        })
    }, [])

    const handleUpdateSelectedAmount = (amount: SelectAmountDataType) => {
        setInput(amount)
    }
    const onSave = () => {
        // Parsing input to Number
        let amountToDispatch: ComposerSlotModel | number | undefined

        if (input.slotModel) {
            amountToDispatch = input.slotModel
        } else {
            const parsedAmount = parseInt(input.amount)
            if (!isNaN(parsedAmount)) {
                amountToDispatch = parsedAmount
            }
        }

        if (amountToDispatch !== undefined) {
            dispatch({
                type: 'UPDATE_RECIPIENT_ALLOCATION',
                payload: {
                    recipientId: recipientAllocation.recipientModel.id,
                    amount: amountToDispatch,
                },
            })
            onClose()
        } else {
            console.error('Amount must be numeric!')
        }
    }

    return (
        <BaseFormContainer>
            <BaseFormGroupContainer>
                <SelectOrCreateAmount
                    amountData={input}
                    updateSelectedAmount={handleUpdateSelectedAmount}
                />
            </BaseFormGroupContainer>
            <Button
                primary
                disabled={
                    input.amount ===
                    recipientAllocation.amountModel?.data.toString()
                }
                label="Save"
                onClick={onSave}
            />
        </BaseFormContainer>
    )
}

export default UpdateRecipientAllocationForm
