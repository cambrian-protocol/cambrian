import BaseSlotInputItem, { BaseSlotInputItemProps } from './BaseSlotInputItem'
import { Box, Text } from 'grommet'

type RecipientAllocationItemProps = BaseSlotInputItemProps & {
    role?: string
    amount: string
}

// TODO Slot Prop
const RecipientAllocationItem = ({
    amount,
    role,
}: RecipientAllocationItemProps) => {
    return (
        <BaseSlotInputItem
            label={role}
            title="jon.eth"
            subTitle="0x90187450198501785"
        >
            <Box align="end">
                <Text>{amount}</Text>
                <Text size="small" color="dark-6">
                    {amount}
                </Text>
            </Box>
        </BaseSlotInputItem>
    )
}

export default RecipientAllocationItem
