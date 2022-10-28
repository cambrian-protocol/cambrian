import BaseLayerModal from '../../../components/modals/BaseLayerModal'
import { Box } from 'grommet'
import ModalHeader from '@cambrian/app/components/layout/header/ModalHeader'
import { RecipientAllocationInfoType } from '@cambrian/app/components/info/solver/BaseSolverInfo'
import RecipientAllocationItem from '../../../components/list/RecipientAllocationItem'
import { TokenModel } from '@cambrian/app/models/TokenModel'

interface RecipientAllocationModalProps {
    onClose: () => void
    recipientAllocations: RecipientAllocationInfoType[]
    token?: TokenModel
}

const RecipientAllocationModal = ({
    onClose,
    recipientAllocations,
    token,
}: RecipientAllocationModalProps) => (
    <BaseLayerModal onClose={onClose}>
        <ModalHeader
            title="Recipients token allocation"
            description="Payouts when the selected outcome is confirmed."
        />
        <Box gap="medium" height={{ min: 'auto' }}>
            {recipientAllocations.map((recipientAllocation, idx) => {
                return (
                    <RecipientAllocationItem
                        token={token}
                        key={idx}
                        recipientAllocationInfo={recipientAllocation}
                    />
                )
            })}
        </Box>
    </BaseLayerModal>
)

export default RecipientAllocationModal
