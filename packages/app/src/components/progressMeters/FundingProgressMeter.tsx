import { Box, Meter, Stack, Text } from 'grommet'

import { BigNumber } from '@ethersproject/bignumber'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { ethers } from 'ethers'

interface FundingProgressMeterProps {
    fundingGoal: BigNumber
    funding: BigNumber
    token: TokenModel
    userFunding: BigNumber
}

const FundingProgressMeter = ({
    fundingGoal,
    funding,
    token,
    userFunding,
}: FundingProgressMeterProps) => {
    const formattedFunding = ethers.utils.formatUnits(funding, token.decimals)
    const formattedFundingGoal = ethers.utils.formatUnits(
        fundingGoal,
        token.decimals
    )
    const formattedUserFunding = ethers.utils.formatUnits(
        userFunding,
        token.decimals
    )
    const percentageValue =
        funding.toString() !== '0' && fundingGoal.toString() !== '0'
            ? funding.mul(BigNumber.from(100)).div(fundingGoal)
            : BigNumber.from(0)

    return (
        <Box pad="medium">
            <Box align="center" pad={{ vertical: 'medium' }}>
                <Stack anchor="center">
                    <Meter
                        type="circle"
                        values={[{ value: Number(percentageValue) }]}
                        size="xsmall"
                        thickness="small"
                    />
                    <Box
                        direction="row"
                        align="center"
                        pad={{ bottom: 'small' }}
                    >
                        <Text size="xlarge">
                            {Number(percentageValue).toFixed()}
                        </Text>
                        <Text size="small">%</Text>
                    </Box>
                </Stack>
                <Text textAlign="center">
                    {formattedFunding} / {formattedFundingGoal}
                </Text>
                <Text textAlign="center" size="small" color="dark-4">
                    Remaining:{' '}
                    {Number(formattedFundingGoal) - Number(formattedFunding)}
                </Text>
                <Text textAlign="center" size="small" color="dark-4">
                    Your funds: {Number(formattedUserFunding)}
                </Text>
            </Box>
        </Box>
    )
}

export default FundingProgressMeter
