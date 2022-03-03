import { Box, Button } from 'grommet'
import {
    ComposerSlotModel,
    ComposerSlotPathType,
} from '@cambrian/app/src/models/SlotModel'
import SelectOrCreateAmount, {
    SelectAmountDataType,
} from '@cambrian/app/components/selects/SelectOrCreateAmount'
import { useEffect, useState } from 'react'

import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import { ComposerAllocationType } from '@cambrian/app/models/ConditionModel'
import HeaderTextSection from '@cambrian/app/src/components/sections/HeaderTextSection'
import { useComposerContext } from '@cambrian/app/src/store/composer/composer.context'

type UpdateAllocationModalProps = {
    allocation: ComposerAllocationType
    recipientSlotPath: ComposerSlotPathType
    onClose: () => void
}

/* TODO
    - Proper Error handling if amount is not numeric

*/
const UpdateAllocationModal = ({
    onClose,
    allocation,
    recipientSlotPath,
}: UpdateAllocationModalProps) => {
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
        <BaseLayerModal onClose={onClose}>
            <HeaderTextSection
                title="Define share"
                subTitle="Choose an existant amount to save gas"
                paragraph="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel erat et enim blandit pharetra. Nam nec justo ultricies, tristique justo eget, dignissim turpis."
            />
            <Box gap="small" fill="horizontal">
                <Box flex>
                    <SelectOrCreateAmount
                        amountData={amountData}
                        setAmountData={setAmountData}
                    />
                </Box>
                <Button
                    primary
                    disabled={
                        amountData.amount ===
                        allocation.amountModel?.data.toString()
                    }
                    label="Save"
                    onClick={onSave}
                />
            </Box>
        </BaseLayerModal>
    )
}

export default UpdateAllocationModal
