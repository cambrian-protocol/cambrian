import { Box, Heading, Text } from 'grommet'

import { SUPPORTED_CHAINS } from 'packages/app/config/SupportedChains'

const WrongChainSection = () => (
    <Box height={{ min: '90vh' }} justify="center" align="center" gap="small">
        <Text size="small" color="dark-4">
            You're connected to an unsupported chain
        </Text>
        <Heading level="2" textAlign="center">
            Please connect your Wallet to one of our supported chains
        </Heading>
        {Object.keys(SUPPORTED_CHAINS).map((chain) => (
            <Text key={chain}>
                {SUPPORTED_CHAINS[Number(chain)].chainData.name}
            </Text>
        ))}
    </Box>
)

export default WrongChainSection
