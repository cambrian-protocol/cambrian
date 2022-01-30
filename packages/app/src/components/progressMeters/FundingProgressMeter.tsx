import { Box, Meter, Stack, Text } from 'grommet'

interface FundingProgressMeterProps {
    total: number
    current: number
}

const FundingProgressMeter = ({
    total,
    current,
}: FundingProgressMeterProps) => {
    const percentageValue = (current * 100) / total
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
                        <Text size="xlarge">{percentageValue}</Text>
                        <Text size="small">%</Text>
                    </Box>
                </Stack>
                <Text textAlign="center" size="small" color="dark-5">
                    {current}/{total}
                </Text>
            </Box>
        </Box>
    )
}

export default FundingProgressMeter
