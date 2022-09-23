import { Box, Spinner, Text } from 'grommet'

interface LoadingScreenProps {
    context?: string
}

const LoadingScreen = ({ context }: LoadingScreenProps) => (
    <Box
        fill
        justify="center"
        align="center"
        background={'background-back'}
        gap="medium"
    >
        <Spinner size="medium" />
        <Box width={'medium'}>
            <Text textAlign="center" size="small" color="dark-4">
                {context || 'Loading...'}
            </Text>
        </Box>
    </Box>
)

export default LoadingScreen
