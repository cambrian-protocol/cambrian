import { Box, Text } from 'grommet'

import { Warning } from 'phosphor-react'

// TODO Change on Prod / Link to list of supported chains
const ChainWarningContainer = () => {
    return (
        <Box pad="small">
            <Box
                pad="medium"
                background="status-warning"
                round="small"
                align="center"
                justify="center"
                direction="row"
                gap="small"
                elevation="small"
            >
                <Box width={{ min: 'auto' }}>
                    <Warning size="24" />
                </Box>
                <Text>
                    Warning, you are connected to an unsupported Chain. Please
                    connect to the Ropsten Test Network.
                </Text>
            </Box>
        </Box>
    )
}

export default ChainWarningContainer
