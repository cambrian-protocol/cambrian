import { ComposerSlotPathType } from '@cambrian/app/models/SlotModel'
import { Text } from 'grommet'

interface ReferencedSlotInfoProps {
    reference: ComposerSlotPathType
}

const ReferencedSlotInfo = ({ reference }: ReferencedSlotInfoProps) => {
    return (
        <Text size="small" color="status-warning">
            This is a reference to a slot of the solver: {reference.solverId}{' '}
            and its slot: {reference.slotId}. If you want to edit the data,
            please edit the referenced slot directly.
        </Text>
    )
}

export default ReferencedSlotInfo
