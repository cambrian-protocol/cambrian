import BaseLayerModal from './BaseLayerModal'
import { Box } from 'grommet'
import HeaderTextSection from '../sections/HeaderTextSection'
import RecipientAllocationItem from '../list/RecipientAllocationItem'

interface RecipientAllocationModalProps {
    onClose: () => void
    allocations: { address: string; amount: string }[]
}

const RecipientAllocationModal = ({
    onClose,
    allocations,
}: RecipientAllocationModalProps) => {
    console.log(allocations)
    return (
        <BaseLayerModal onClose={onClose}>
            <HeaderTextSection
                title={'Allocation'}
                subTitle={'Who gets what?'}
                paragraph={'Lorem Ipsum'}
            />
            <Box gap="medium" fill>
                {allocations.map((allocation, idx) => (
                    <RecipientAllocationItem
                        key={idx}
                        title={allocation.address}
                        amount={allocation.amount}
                    />
                ))}
            </Box>
        </BaseLayerModal>
    )
}

export default RecipientAllocationModal
