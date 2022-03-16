import { Box, Meter, Stack, Text } from 'grommet'

interface FundingProgressMeterProps {
    fundingGoal: number
    funding: number
}

const FundingProgressMeter = ({
    fundingGoal,
    funding,
}: FundingProgressMeterProps) => {
    const percentageValue = (funding * 100) / fundingGoal
    return (
        <Box fill>
            <Box align="center" pad="large">
                <Stack anchor="center">
                    <Meter
                        type="circle"
                        background="light-2"
                        values={[{ value: percentageValue }]}
                        size="xsmall"
                        thickness="small"
                    />
                    <Box
                        direction="row"
                        align="center"
                        pad={{ bottom: 'small' }}
                    >
                        <Text size="xlarge">{percentageValue.toFixed()}</Text>
                        <Text size="small">%</Text>
                    </Box>
                </Stack>
                <Text textAlign="center" size="small" color="dark-5">
                    {funding}/{fundingGoal}
                </Text>
            </Box>
        </Box>
    )
}

export default FundingProgressMeter
