import { AllocationModel } from '@cambrian/app/models/AllocationModel'
import BaseLayerModal from './BaseLayerModal'
import { Box } from 'grommet'
import HeaderTextSection from '../sections/HeaderTextSection'
import RecipientAllocationItem from '../list/RecipientAllocationItem'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { decodeData } from '@cambrian/app/utils/helpers/decodeData'

interface RecipientAllocationModalProps {
    onClose: () => void
    allocations: AllocationModel[]
    token: TokenModel
}

const RecipientAllocationModal = ({
    onClose,
    allocations,
    token,
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
                        [SolidityDataTypes.Address],
                        allocation.addressSlot.slot.data
                    )
                    return (
                        <RecipientAllocationItem
                            key={idx}
                            title={allocation.addressSlot.tag?.label}
                            subTitle={decodedAddress}
                            amount={allocation.amount}
                            amountPercentage={allocation.amountPercentage}
                            token={token}
                        />
                    )
                })}
            </Box>
        </BaseLayerModal>
    )
}

export default RecipientAllocationModal
