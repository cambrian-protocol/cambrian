import { AllocationModel } from '@cambrian/app/models/AllocationModel'
import BaseLayerModal from './BaseLayerModal'
import { Box } from 'grommet'
import HeaderTextSection from '../sections/HeaderTextSection'
import RecipientAllocationItem from '../list/RecipientAllocationItem'
import { decodeData } from '@cambrian/app/utils/helpers/decodeData'

interface RecipientAllocationModalProps {
    onClose: () => void
    allocations: AllocationModel[]
}

const RecipientAllocationModal = ({
    onClose,
    allocations,
}: RecipientAllocationModalProps) => {
    return (
        <BaseLayerModal onClose={onClose}>
            <HeaderTextSection
                title={'Token Distribution'}
                subTitle={'Who gets what?'}
                paragraph={'Payouts when the selected outcome is confirmed.'}
            />
            <Box gap="medium" fill>
                {allocations.map((allocation, idx) => {
                    const decodedAddress = decodeData(
                        allocation.addressSlot.tag.dataTypes,
                        allocation.addressSlot.slot.data
                    )
                    return (
                        <RecipientAllocationItem
                            key={idx}
                            title={allocation.addressSlot.tag.label}
                            subTitle={decodedAddress}
                            amount={allocation.amount}
                            amountPercentage={allocation.amountPercentage}
                        />
                    )
                })}
            </Box>
        </BaseLayerModal>
    )
}

export default RecipientAllocationModal
