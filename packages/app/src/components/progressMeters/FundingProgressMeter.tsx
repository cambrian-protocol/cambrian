import { BigNumber } from '@ethersproject/bignumber'
import { Box, Meter, Stack, Text } from 'grommet'

interface FundingProgressMeterProps {
    fundingGoal: BigNumber
    funding: BigNumber
}

const FundingProgressMeter = ({
    fundingGoal,
    funding,
}: FundingProgressMeterProps) => {
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
                        background="light-2"
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
                <Text textAlign="center" size="small" color="dark-5">
                    {Number(funding)}/{Number(fundingGoal)}
                </Text>
                <Text textAlign="center" size="small" color="dark-5">
                    Remaining: {fundingGoal.sub(funding).toString()}
                </Text>
            </Box>
        </Box>
    )
}

export default FundingProgressMeter
