import BaseSlotInputItem, { BaseSlotInputItemProps } from './BaseSlotInputItem'
import { Box, Text } from 'grommet'

type RecipientAllocationItemProps = BaseSlotInputItemProps & {
    amountPercentage: string
    amount?: string
}

export type RecipientAllocationItemType = {
    description: string
    address: string
    amountPercentage: string
    amount?: string
}

const RecipientAllocationItem = ({
    amountPercentage,
    title,
    subTitle,
    amount,
}: RecipientAllocationItemProps) => {
    return (
        <BaseSlotInputItem title={title} subTitle={subTitle}>
            <Box align="end">
                <Text>{amountPercentage}%</Text>
                <Text size="small" color="dark-6">
                    {amount}
                </Text>
            </Box>
        </BaseSlotInputItem>
    )
}

export default RecipientAllocationItem
