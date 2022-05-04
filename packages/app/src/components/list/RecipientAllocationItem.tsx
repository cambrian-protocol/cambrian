import BaseSlotInputItem, { BaseSlotInputItemProps } from './BaseSlotInputItem'
import { BigNumber, ethers } from 'ethers'
import { Box, Text } from 'grommet'

import { TokenModel } from '@cambrian/app/models/TokenModel'

type RecipientAllocationItemProps = BaseSlotInputItemProps & {
    amountPercentage: string
    amount?: BigNumber
    token: TokenModel
}

const RecipientAllocationItem = ({
    amountPercentage,
    title,
    address,
    amount,
    token,
}: RecipientAllocationItemProps) => (
    <BaseSlotInputItem title={title} address={address}>
        <Box align="end">
            <Text>{amountPercentage}%</Text>
            <Text size="small" color="dark-6">
                {amount &&
                    `Minted: ${
                        Number(
                            ethers.utils.formatUnits(amount, token.decimals)
                        ) / 10000
                    }`}
            </Text>
        </Box>
    </BaseSlotInputItem>
)

export default RecipientAllocationItem
