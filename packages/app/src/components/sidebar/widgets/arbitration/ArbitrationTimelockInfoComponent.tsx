import { Box } from 'grommet'
import { Calendar } from 'phosphor-react'
import { Heading } from 'grommet'
import { Text } from 'grommet'

interface ArbitrationTimelockInfoComponentProps {
    timelock: number
}

const ArbitrationTimelockInfoComponent = ({
    timelock,
}: ArbitrationTimelockInfoComponentProps) => {
    return (
        <Box gap="medium" pad={{ bottom: 'medium' }}>
            <>
                <Heading level="4">Timeframe</Heading>
                <Text size="small" color="dark-4">
                    Be aware - A dispute can just be raised during the active
                    timelock until:
                </Text>
            </>
            <Box direction="row" gap="small" align="center">
                <Box width={{ min: 'auto' }}>
                    <Calendar size="24" />
                </Box>
                <Text>{new Date(timelock * 1000).toLocaleString()}</Text>
            </Box>
        </Box>
    )
}

export default ArbitrationTimelockInfoComponent
