import { Box, Button, Form, FormExtendedEvent, FormField } from 'grommet'
import SelectOrCreateAmount, {
    SelectAmountDataType,
} from '@cambrian/app/components/selects/SelectOrCreateAmount'

import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import { RecipientFormType } from '../../../solver/recipientList/forms/CreateRecipientForm'
import { SlotModel } from '@cambrian/app/models/SlotModel'
import { required } from '@cambrian/app/src/utils/helpers/validation'
import { useComposerContext } from '@cambrian/app/src/store/composer/composer.context'
import { useState } from 'react'

type CreateRecipientAmountFormProps = {
    onClose: () => void
}

const CreateRecipientAmountForm = ({
    onClose,
}: CreateRecipientAmountFormProps) => {
    const { dispatch } = useComposerContext()

    const [input, setInput] = useState<RecipientFormType>({
        address: '',
        description: '',
    })
    const [amountData, setAmountData] = useState<SelectAmountDataType>({
        amount: '',
    })

    const onSubmit = (event: FormExtendedEvent<RecipientFormType, Element>) => {
        event.preventDefault()

        let amountToSave: SlotModel | number | undefined
        if (amountData.slotModel !== undefined) {
            amountToSave = amountData.slotModel
        } else {
            const parsedAmount = parseInt(amountData.amount)
            if (!isNaN(parsedAmount)) {
                amountToSave = parsedAmount
            }
        }

        if (amountToSave !== undefined) {
            dispatch({
                type: 'CREATE_RECIPIENT_WITH_AMOUNT',
                payload: {
                    recipient: input,
                    amount: amountToSave,
                },
            })
            onClose()
        }
    }

    return (
        <>
            <HeaderTextSection
                title="Create new recipient"
                subTitle="and allocate amount"
                paragraph="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel erat et enim blandit pharetra."
            />
            <Box fill>
                <Form<RecipientFormType>
                    value={input}
                    onSubmit={(event) => onSubmit(event)}
                    onChange={(nextValue: RecipientFormType) => {
                        setInput(nextValue)
                    }}
                >
                    <FormField
                        name="address"
                        label="Address*"
                        validate={required}
                    />
                    <FormField
                        name="description"
                        label="Descriptive Name (Optional)"
                    />
                    <FormField>
                        <SelectOrCreateAmount
                            amountData={amountData}
                            setAmountData={setAmountData}
                        />
                    </FormField>
                    <Box>
                        <Button
                            primary
                            type="submit"
                            label="Create Recipient"
                        />
                    </Box>
                </Form>
            </Box>
        </>
    )
}

export default CreateRecipientAmountForm
