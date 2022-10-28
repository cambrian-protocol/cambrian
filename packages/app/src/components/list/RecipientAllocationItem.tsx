import { Box, Text } from 'grommet'
import RecipientItem, { RecipientItemProps } from './RecipientItem'

import { RecipientAllocationInfoType } from '../info/solver/BaseSolverInfo'
import { TokenModel } from '@cambrian/app/models/TokenModel'

type RecipientAllocationItemProps = RecipientItemProps & {
    recipientAllocationInfo: RecipientAllocationInfoType
    token?: TokenModel
}

const RecipientAllocationItem = ({
    recipientAllocationInfo,
    token,
}: RecipientAllocationItemProps) => {
    return (
        <RecipientItem
            title={recipientAllocationInfo.recipient.slotTag.label}
            address={recipientAllocationInfo.recipient.address}
        >
            <Box align="end">
                <Text>{recipientAllocationInfo.allocation.percentage}%</Text>
                <Text size="small" color="dark-4" textAlign="end">
                    {recipientAllocationInfo.allocation.amount &&
                        `${recipientAllocationInfo.allocation.amount} ${
                            token?.symbol || '??'
                        }`}
                </Text>
            </Box>
        </RecipientItem>
    )
}

export default RecipientAllocationItem
