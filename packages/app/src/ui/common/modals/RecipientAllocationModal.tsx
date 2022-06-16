import { AllocationModel } from '@cambrian/app/models/AllocationModel'
import BaseLayerModal from '../../../components/modals/BaseLayerModal'
import { Box } from 'grommet'
import RecipientAllocationItem from '../../../components/list/RecipientAllocationItem'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { decodeData } from '@cambrian/app/utils/helpers/decodeData'
import ModalHeader from '@cambrian/app/components/layout/header/ModalHeader'
import { Coins } from 'phosphor-react'

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
            <ModalHeader
                icon={<Coins />}
                title="Token Allocation"
                description="Payouts when the selected outcome is confirmed."
            />
            <Box gap="medium" height={{ min: 'auto' }}>
                {allocations.map((allocation, idx) => {
                    const decodedAddress = decodeData(
                        [SolidityDataTypes.Address],
                        allocation.addressSlot.slot.data
                    )
                    return (
                        <RecipientAllocationItem
                            key={idx}
                            title={allocation.addressSlot.tag?.label}
                            address={decodedAddress}
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
