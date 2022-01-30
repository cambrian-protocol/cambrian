import { Box, Button, Form, FormExtendedEvent, FormField } from 'grommet'
import SelectOrCreateAmount, {
    SelectAmountDataType,
} from '@cambrian/app/components/selects/SelectOrCreateAmount'
import SelectRecipient, {
    SelectRecipientType,
} from '@cambrian/app/components/selects/SelectRecipient'

import { FloppyDisk } from 'phosphor-react'
import HeaderTextSection from '@cambrian/app/src/components/sections/HeaderTextSection'
import { SlotModel } from '@cambrian/app/models/SlotModel'
import { useComposerContext } from '@cambrian/app/src/store/composer/composer.context'
import { useState } from 'react'

type SelectRecipientAmountFormProps = {
    onClose: () => void
}

const SelectRecipientAmountForm = ({
    onClose,
}: SelectRecipientAmountFormProps) => {
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
                    type: 'ADD_RECIPIENT_WITH_AMOUNT',
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
                subTitle="Choose an existant address from your solution"
                paragraph="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel erat et enim blandit pharetra. Nam nec justo ultricies, tristique justo eget, dignissim turpis."
            />
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
                    <Button
                        primary
                        type="submit"
                        label="Save"
                        icon={<FloppyDisk size="24" />}
                    />
                </Box>
            </Form>
        </Box>
    )
}

export default SelectRecipientAmountForm
