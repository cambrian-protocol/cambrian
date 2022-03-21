import { Box, Button } from 'grommet'
import {
    ComposerSlotModel,
    ComposerSlotPathType,
} from '@cambrian/app/src/models/SlotModel'
import SelectOrCreateAmount, {
    SelectAmountDataType,
} from '@cambrian/app/components/selects/SelectOrCreateAmount'
import { useEffect, useState } from 'react'

import BaseFormContainer from '@cambrian/app/components/containers/BaseFormContainer'
import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import { ComposerAllocationType } from '@cambrian/app/models/AllocationModel'
import HeaderTextSection from '@cambrian/app/src/components/sections/HeaderTextSection'
import { useComposerContext } from '@cambrian/app/src/store/composer/composer.context'

type UpdateRecipientAllocationModalProps = {
    allocation: ComposerAllocationType
    recipientSlotPath: ComposerSlotPathType
    onClose: () => void
}

/* TODO
    - Proper Error handling if amount is not numeric

*/
const UpdateRecipientAllocationModal = ({
    onClose,
    allocation,
    recipientSlotPath,
}: UpdateRecipientAllocationModalProps) => {
    const { dispatch } = useComposerContext()
    const [amountData, setAmountData] = useState<SelectAmountDataType>({
        amount: '',
    })

    useEffect(() => {
        if (allocation !== undefined) {
            setAmountData({
                amount: allocation.amountModel.data.toString(),
                slotModel: allocation.amountModel,
            })
        }
    }, [])

    const onSave = () => {
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
                type: 'UPDATE_RECIPIENT_ALLOCATION',
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
        <BaseLayerModal onClose={onClose}>
            <HeaderTextSection
                title="Define the share"
                subTitle="Choose an existing amount to save gas"
                paragraph="Amounts are denoted in Basis Points. 100 BPs = 1%"
            />
            <Box gap="small" fill="horizontal">
                <BaseFormContainer gap="small">
                    <SelectOrCreateAmount
                        amountData={amountData}
                        setAmountData={setAmountData}
                    />
                    <Button
                        primary
                        disabled={
                            amountData.amount ===
                            allocation.amountModel?.data.toString()
                        }
                        label="Save"
                        onClick={onSave}
                    />
                </BaseFormContainer>
            </Box>
        </BaseLayerModal>
    )
}

export default UpdateRecipientAllocationModal
