import BaseSlotInputItem, { BaseSlotInputItemProps } from './BaseSlotInputItem'
import { Box, Text } from 'grommet'

import { BigNumber } from 'ethers'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { formatDecimals } from '@cambrian/app/utils/helpers/tokens'

type RecipientAllocationItemProps = BaseSlotInputItemProps & {
    amountPercentage: string
    amount?: BigNumber
    token: TokenModel
}

const RecipientAllocationItem = ({
    amountPercentage,
    title,
    subTitle,
    amount,
    token,
}: RecipientAllocationItemProps) => {
    return (
        <BaseSlotInputItem title={title} subTitle={subTitle}>
            <Box align="end">
                <Text>{amountPercentage}%</Text>
                <Text size="small" color="dark-6">
                    {amount && Number(formatDecimals(token, amount))}
                </Text>
            </Box>
        </BaseSlotInputItem>
    )
}

export default RecipientAllocationItem
