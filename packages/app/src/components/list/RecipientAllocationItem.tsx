import BaseSlotInputItem, { BaseSlotInputItemProps } from './BaseSlotInputItem'
import { Box, Text } from 'grommet'

type RecipientAllocationItemProps = BaseSlotInputItemProps & {
    amount: string
}

// TODO Calculate actual amount
const RecipientAllocationItem = ({
    amount,
    title,
    subTitle,
}: RecipientAllocationItemProps) => {
    const amountPercentage = parseInt(amount) / 100

    return (
        <BaseSlotInputItem title={title} subTitle={subTitle}>
            <Box align="end">
                <Text>{amountPercentage}%</Text>
                {/*  <Text size="small" color="dark-6">
                    {amount}
                </Text> */}
            </Box>
        </BaseSlotInputItem>
    )
}

export default RecipientAllocationItem
