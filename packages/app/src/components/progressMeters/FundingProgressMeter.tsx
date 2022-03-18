import { Box, Meter, Stack, Text } from 'grommet'

import { BigNumber } from '@ethersproject/bignumber'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { formatDecimals } from '@cambrian/app/utils/helpers/tokens'

interface FundingProgressMeterProps {
    fundingGoal: BigNumber
    funding: BigNumber
    token: TokenModel
}

const FundingProgressMeter = ({
    fundingGoal,
    funding,
    token,
}: FundingProgressMeterProps) => {
    const formattedFunding = Number(formatDecimals(token, funding))
    const formattedFundingGoal = Number(formatDecimals(token, fundingGoal))
    const percentageValue =
        funding.toString() !== '0' && fundingGoal.toString() !== '0'
            ? funding.mul(BigNumber.from(100)).div(fundingGoal)
            : BigNumber.from(0)

    return (
        <Box fill>
            <Box align="center" pad="large">
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
                <Text textAlign="center" size="small" color="dark-4">
                    {formattedFunding}/{formattedFundingGoal}
                </Text>
                <Text textAlign="center" size="small" color="dark-4">
                    Remaining: {formattedFundingGoal - formattedFunding}
                </Text>
            </Box>
        </Box>
    )
}

export default FundingProgressMeter
