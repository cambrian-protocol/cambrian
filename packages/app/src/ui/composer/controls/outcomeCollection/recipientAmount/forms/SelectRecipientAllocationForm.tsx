import { Box, Button, Form, FormExtendedEvent, FormField } from 'grommet'
import SelectOrCreateAmount, {
    SelectAmountDataType,
} from '@cambrian/app/components/selects/SelectOrCreateAmount'
import SelectRecipient, {
    SelectRecipientType,
} from '@cambrian/app/components/selects/SelectRecipient'

import BaseFormContainer from '@cambrian/app/components/containers/BaseFormContainer'
import { ComposerSlotModel } from '@cambrian/app/models/SlotModel'
import HeaderTextSection from '@cambrian/app/src/components/sections/HeaderTextSection'
import { useComposerContext } from '@cambrian/app/src/store/composer/composer.context'
import { useState } from 'react'

type SelectRecipientAllocationFormProps = {
    onClose: () => void
}

const SelectRecipientAllocationForm = ({
    onClose,
}: SelectRecipientAllocationFormProps) => {
    const { dispatch } = useComposerContext()

    const [selectedRecipient, setSelectedRecipient] =
        useState<SelectRecipientType>({
            title: '',
        })

    const [amountData, setAmountData] = useState<SelectAmountDataType>({
        amount: '',
    })

    const onSubmit = (event: FormExtendedEvent<{}, Element>) => {
        event.preventDefault()
        if (selectedRecipient.address !== undefined) {
            let amountToSave: ComposerSlotModel | number | undefined
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
                    type: 'ADD_RECIPIENT_WITH_ALLOCATION',
                    payload: {
                        amount: amountToSave,
                        recipient: selectedRecipient.address,
                    },
                })
            }
        }
        onClose()
    }

    return (
        <Box gap="small">
            <HeaderTextSection
                title="Select recipient with amount"
                subTitle="Choose an existing address"
                paragraph="This recipient can redeem tokens for Solver funds when an outcome collection allocated to them occurs."
            />
            <BaseFormContainer>
                <Form onSubmit={(event) => onSubmit(event)}>
                    <FormField>
                        <SelectRecipient
                            selectedRecipient={selectedRecipient}
                            setSelectedRecipient={setSelectedRecipient}
                        />
                    </FormField>
                    <FormField>
                        <SelectOrCreateAmount
                            amountData={amountData}
                            setAmountData={setAmountData}
                        />
                    </FormField>
                    <Box>
                        <Button primary type="submit" label="Save" />
                    </Box>
                </Form>
            </BaseFormContainer>
        </Box>
    )
}

export default SelectRecipientAllocationForm
