import { BigNumber, ethers } from 'ethers'
import { Box, Heading, Text } from 'grommet'

import BaseTokenBadge from '../token/BaseTokenBadge'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { truncateAmount } from '@cambrian/app/utils/helpers/redeemHelper'

interface ClaimItemProps {
    title: string
    collateralToken: TokenModel
    descriptions?: string[]
    amount: BigNumber
    note?: string
}

const ClaimItem = ({
    collateralToken,
    title,
    amount,
    descriptions,
    note,
}: ClaimItemProps) => {
    return (
        <Box gap="xsmall">
            <Heading level="4">{title}</Heading>
            <Box direction="row" justify="between" align="end">
                <Box gap="xsmall" pad={{ bottom: 'xsmall' }} alignSelf="start">
                    {descriptions &&
                        descriptions.map((description, idx) => (
                            <Text key={idx} color="dark-4" size="small">
                                {description}
                            </Text>
                        ))}
                </Box>
                <Box>
                    <Text size="xsmall" color="dark-4">
                        {note}
                    </Text>
                    <Box direction="row" gap="small" align="center">
                        <Text weight={'bold'} size="xlarge">
                            {truncateAmount(ethers.utils.formatUnits(amount))}
                        </Text>
                        <BaseTokenBadge token={collateralToken} />
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

export default ClaimItem
