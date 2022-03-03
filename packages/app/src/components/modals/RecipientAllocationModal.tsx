import {
    SlotWithMetaDataModel,
    SolverContractCondition,
    SolverModel,
} from '@cambrian/app/models/SolverModel'

import BaseLayerModal from './BaseLayerModal'
import { Box } from 'grommet'
import HeaderTextSection from '../sections/HeaderTextSection'
import RecipientAllocationItem from '../list/RecipientAllocationItem'
import { decodeData } from '@cambrian/app/utils/helpers/decodeData'

interface RecipientAllocationModalProps {
    onClose: () => void
    allocations: { address: SlotWithMetaDataModel; amount: string }[]
    solverData: SolverModel
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
                {allocations.map((allocation, idx) => {
                    const decodedAddress = decodeData(
                        [allocation.address.dataType],
                        allocation.address.slot.data
                    )
                    return (
                        <RecipientAllocationItem
                            key={idx}
                            title={allocation.address.description}
                            subTitle={decodedAddress}
                            amount={allocation.amount}
                            solverData={solverData}
                            currentCondition={currentCondition}
                        />
                    )
                })}
            </Box>
        </BaseLayerModal>
    )
}

export default RecipientAllocationModal
