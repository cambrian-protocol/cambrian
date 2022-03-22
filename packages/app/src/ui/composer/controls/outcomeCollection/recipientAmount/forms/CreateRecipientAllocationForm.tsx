import { Box, Button, Form, FormExtendedEvent, FormField } from 'grommet'
import SelectOrCreateAmount, {
    SelectAmountDataType,
} from '@cambrian/app/components/selects/SelectOrCreateAmount'

import BaseFormContainer from '@cambrian/app/components/containers/BaseFormContainer'
import BaseMenuListItem from '@cambrian/app/components/buttons/BaseMenuListItem'
import { ComposerSlotModel } from '@cambrian/app/models/SlotModel'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import { RecipientFormType } from '../../../solver/recipientList/forms/RecipientConfigForm'
import { SlotTagFormInputType } from '../../../solver/general/forms/SlotTagForm'
import SlotTagModal from '../../../solver/general/modals/SlotTagModal'
import { Tag } from 'phosphor-react'
import { initialSlotTagInput } from '../../../solver/slotList/modals/CreateSlotModal'
import { required } from '@cambrian/app/src/utils/helpers/validation'
import { useComposerContext } from '@cambrian/app/src/store/composer/composer.context'
import { useState } from 'react'

type CreateRecipientAllocationFormProps = {
    onClose: () => void
}

const CreateRecipientAllocationForm = ({
    onClose,
}: CreateRecipientAllocationFormProps) => {
    const { dispatch } = useComposerContext()

    const [showSlotTagModal, setShowSlotTagModal] = useState(false)

    const toggleShowSlotTagModal = () => setShowSlotTagModal(!showSlotTagModal)

    const [input, setInput] = useState<RecipientFormType>({
        address: '',
    })
    const [amountData, setAmountData] = useState<SelectAmountDataType>({
        amount: '',
    })

    const [slotTagInput, setSlotTagInput] =
        useState<SlotTagFormInputType>(initialSlotTagInput)

    const onSubmit = (event: FormExtendedEvent<RecipientFormType, Element>) => {
        event.preventDefault()

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
                type: 'CREATE_RECIPIENT_WITH_ALLOCATION',
                payload: {
                    recipient: input,
                    amount: amountToSave,
                    slotTag: slotTagInput,
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
                paragraph="They will receive conditional tokens when included in an outcome collection."
            />
            <Box fill>
                <BaseMenuListItem
                    subTitle="Define a label, a description and more..."
                    title="Tag"
                    icon={<Tag />}
                    onClick={toggleShowSlotTagModal}
                />
                <PlainSectionDivider />
                <HeaderTextSection paragraph="Setup the address of the recipient." />
                <BaseFormContainer>
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
                </BaseFormContainer>
            </Box>
            {showSlotTagModal && (
                <SlotTagModal
                    onBack={toggleShowSlotTagModal}
                    slotTagInput={slotTagInput}
                    onSubmit={(slotTag: SlotTagFormInputType) => {
                        setSlotTagInput(slotTag)
                    }}
                />
            )}
        </>
    )
}

export default CreateRecipientAllocationForm
