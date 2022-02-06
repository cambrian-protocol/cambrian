import BaseLayerModal from './BaseLayerModal'
import { Box } from 'grommet'
import HeaderTextSection from '../sections/HeaderTextSection'
import RecipientAllocationItem from '../list/RecipientAllocationItem'

interface RecipientAllocationModalProps {
    onClose: () => void
}

// TODO Map recipients and allocations
const RecipientAllocationModal = ({
    onClose,
}: RecipientAllocationModalProps) => {
    return (
        <BaseLayerModal onClose={onClose}>
            <HeaderTextSection
                title={'Allocation'}
                subTitle={'Who gets what?'}
                paragraph={'Lorem Ipsum'}
            />
            <Box gap="medium" fill>
                <RecipientAllocationItem
                    role="Keeper"
                    title="Henso.eth"
                    subTitle="0x90187450198501785"
                    amount="10"
                />
                <RecipientAllocationItem
                    role="Arbitrator"
                    title="Joe.eth"
                    subTitle="0x90187450198501785"
                    amount="10"
                />
                <RecipientAllocationItem
                    role="Others"
                    title="Jon.eth"
                    subTitle="0x90187450198501785"
                    amount="10"
                />
                <RecipientAllocationItem
                    title="whoever.eth"
                    subTitle="0x90187450198501785"
                    amount="10"
                />
            </Box>
        </BaseLayerModal>
    )
}

export default RecipientAllocationModal
