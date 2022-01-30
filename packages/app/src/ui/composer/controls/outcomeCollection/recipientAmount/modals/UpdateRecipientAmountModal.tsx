import SelectOrCreateAmount, {
    SelectAmountDataType,
} from '@cambrian/app/components/selects/SelectOrCreateAmount'
import { SlotModel, SlotPath } from '@cambrian/app/src/models/SlotModel'
import { useEffect, useState } from 'react'

import BaseModal from '@cambrian/app/src/components/modals/BaseModal'
import { Box } from 'grommet'
import { FloppyDisk } from 'phosphor-react'
import HeaderTextSection from '@cambrian/app/src/components/sections/HeaderTextSection'
import { RecipientAmountModel } from '@cambrian/app/models/ConditionModel'
import RoundButton from '@cambrian/app/src/components/buttons/RoundButton'
import { useComposerContext } from '@cambrian/app/src/store/composer/composer.context'

type UpdateRecipientAmountModalProps = {
    recipientAmountModel: RecipientAmountModel
    recipientSlotPath: SlotPath
    onClose: () => void
}

/* TODO
    - Proper Error handling if amount is not numeric

*/
const UpdateRecipientAmountModal = ({
    onClose,
    recipientAmountModel: recipientAmountModels,
    recipientSlotPath,
}: UpdateRecipientAmountModalProps) => {
    const { dispatch } = useComposerContext()
    const [amountData, setAmountData] = useState<SelectAmountDataType>({
        amount: '',
    })

    useEffect(() => {
        if (recipientAmountModels !== undefined) {
            setAmountData({
                amount: recipientAmountModels.amountModel.data.toString(),
                slotModel: recipientAmountModels.amountModel,
            })
        }
    }, [])

    const onSave = () => {
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
                type: 'UPDATE_RECIPIENT_AMOUNT',
                payload: {
                    amount: amountToSave,
                    recipient: recipientSlotPath,
                },
            })
            onClose()
        } else {
            console.error('Amount must be numeric!')
        }
    }

    return (
        <BaseModal onClose={onClose}>
            <Box gap="medium">
                <HeaderTextSection
                    title="Define share"
                    subTitle="Choose an existant amount to save gas"
                    paragraph="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel erat et enim blandit pharetra. Nam nec justo ultricies, tristique justo eget, dignissim turpis."
                />
                <Box direction="row" gap="small">
                    <Box flex>
                        <SelectOrCreateAmount
                            amountData={amountData}
                            setAmountData={setAmountData}
                        />
                    </Box>
                    <Box justify="center">
                        <RoundButton
                            icon={<FloppyDisk size="24" />}
                            disabled={
                                amountData.amount ===
                                recipientAmountModels.amountModel?.data.toString()
                            }
                            onClick={onSave}
                        />
                    </Box>
                </Box>
            </Box>
        </BaseModal>
    )
}

export default UpdateRecipientAmountModal
