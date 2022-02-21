import { Box, Spinner } from 'grommet'

const LoadingScreen = () => (
    <Box fill justify="center" align="center" background={'background-back'}>
        <Spinner size="medium" color={'brand'} />
    </Box>
)

export default LoadingScreen
