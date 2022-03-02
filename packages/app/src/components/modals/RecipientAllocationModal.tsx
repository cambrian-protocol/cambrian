import {
    AddressWithMetaDataType,
    SolverContractCondition,
    SolverContractData,
} from '@cambrian/app/models/SolverModel'
import BaseLayerModal from './BaseLayerModal'
import { Box } from 'grommet'
import HeaderTextSection from '../sections/HeaderTextSection'
import RecipientAllocationItem from '../list/RecipientAllocationItem'
import { solversMetaData } from '@cambrian/app/stubs/tags'

interface RecipientAllocationModalProps {
    onClose: () => void
    allocations: { address: AddressWithMetaDataType; amount: string }[]
    solverData: SolverContractData
    currentCondition: SolverContractCondition
}

const RecipientAllocationModal = ({
    onClose,
    allocations,
    solverData,
    currentCondition,
}: RecipientAllocationModalProps) => {
    return (
        <BaseLayerModal onClose={onClose}>
            <HeaderTextSection
                title={'Token Distribution'}
                subTitle={'Who gets what?'}
                paragraph={'Payouts when the selected outcome is confirmed.'}
            />
            <Box gap="medium" fill>
                {allocations.map((allocation, idx) => (
                    <RecipientAllocationItem
                        key={idx}
                        title={allocation.address.description}
                        subTitle={allocation.address.address}
                        amount={allocation.amount}
                        solverData={solverData}
                        currentCondition={currentCondition}
                    />
                ))}
            </Box>
        </BaseLayerModal>
    )
}

export default RecipientAllocationModal
