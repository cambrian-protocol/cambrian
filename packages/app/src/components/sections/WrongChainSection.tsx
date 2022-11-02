import { Box, Heading, Image, Text } from 'grommet'

const WrongChainSection = () => (
    <Box height={{ min: '90vh' }} justify="center" align="center">
        <Box
            style={{ position: 'absolute', top: 0, left: 0 }}
            height={'100%'}
            width={'100%'}
        >
            <Image src="/illustrations/wave.svg" opacity={'0.3'} />
        </Box>
        <Box style={{ position: 'relative' }} width="large" gap="small">
            <Heading level="2">
                Please connect your Wallet to one of our supported chains
            </Heading>
            <Text size="small" color="dark-4">
                You're connected to an unsupported chain. Please hit the
                'Unsupported'-Button at the top-right corner and select a
                supported chain.
            </Text>
        </Box>
    </Box>
)

export default WrongChainSection
