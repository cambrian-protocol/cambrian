import { AddressWithMetaDataType } from '@cambrian/app/models/SolverModel'
import BaseLayerModal from './BaseLayerModal'
import { Box } from 'grommet'
import HeaderTextSection from '../sections/HeaderTextSection'
import RecipientAllocationItem from '../list/RecipientAllocationItem'

interface RecipientAllocationModalProps {
    onClose: () => void
    allocations: { address: AddressWithMetaDataType; amount: string }[]
}

const RecipientAllocationModal = ({
    onClose,
    allocations,
}: RecipientAllocationModalProps) => {
    return (
        <BaseLayerModal onClose={onClose}>
            <HeaderTextSection
                title={'Token distribution'}
                subTitle={'Who gets what?'}
                paragraph={
                    'This is how the tokens are going to be distributed when the selected Outcome has been confirmed'
                }
            />
            <Box gap="medium" fill>
                {allocations.map((allocation, idx) => (
                    <RecipientAllocationItem
                        key={idx}
                        title={allocation.address.description}
                        subTitle={allocation.address.address}
                        amount={allocation.amount}
                    />
                ))}
            </Box>
        </BaseLayerModal>
    )
}

export default RecipientAllocationModal
