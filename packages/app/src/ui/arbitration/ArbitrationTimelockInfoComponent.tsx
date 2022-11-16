import { Box } from 'grommet'
import { Calendar } from 'phosphor-react'
import SidebarComponentContainer from '../../components/containers/SidebarComponentContainer'
import { Text } from 'grommet'

interface ArbitrationTimelockInfoComponentProps {
    timelock: number
}

const ArbitrationTimelockInfoComponent = ({
    timelock,
}: ArbitrationTimelockInfoComponentProps) => {
    return (
        <SidebarComponentContainer
            title="Timelock Active"
            description="Arbitration may be requested by participants until:"
        >
            <Box direction="row" gap="small" align="center">
                <Box width={{ min: 'auto' }}>
                    <Calendar size="24" />
                </Box>
                <Text>{new Date(timelock * 1000).toLocaleString()}</Text>
            </Box>
        </SidebarComponentContainer>
    )
}

export default ArbitrationTimelockInfoComponent
