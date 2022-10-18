import BaseSlotInputItem, { BaseSlotInputItemProps } from './BaseSlotInputItem'
import { Box, Text } from 'grommet'

import { RecipientAllocationInfoType } from '../info/solver/BaseSolverInfo'
import { TokenModel } from '@cambrian/app/models/TokenModel'

type RecipientAllocationItemProps = BaseSlotInputItemProps & {
    recipientAllocationInfo: RecipientAllocationInfoType
    token?: TokenModel
}

const RecipientAllocationItem = ({
    recipientAllocationInfo,
    token,
}: RecipientAllocationItemProps) => {
    const amountInfoContent = (
        <Box align="end">
            <Text>{recipientAllocationInfo.allocation.percentage}%</Text>
            <Text size="small" color="dark-4" textAlign="end">
                {recipientAllocationInfo.allocation.amount &&
                    `${recipientAllocationInfo.allocation.amount} ${
                        token?.symbol || '??'
                    }`}
            </Text>
        </Box>
    )

    return (
        <>
            {recipientAllocationInfo.recipient.address !== '' ? (
                <BaseSlotInputItem
                    title={recipientAllocationInfo.recipient.slotTag.label}
                    address={
                        recipientAllocationInfo.recipient.address !== ''
                            ? recipientAllocationInfo.recipient.address
                            : undefined
                    }
                >
                    {amountInfoContent}
                </BaseSlotInputItem>
            ) : (
                <BaseSlotInputItem
                    title={recipientAllocationInfo.recipient.slotTag.label}
                    subTitle={'To be defined'}
                >
                    {amountInfoContent}
                </BaseSlotInputItem>
            )}
        </>
    )
}

export default RecipientAllocationItem
