import { Box, BoxProps, Spinner } from 'grommet'

const BaseSkeletonBox = ({ height }: BoxProps) => {
    return (
        <Box
            height={height}
            background={'background-contrast-hover'}
            round="xsmall"
            style={{ opacity: '0.5' }}
            justify="center"
            align="center"
        >
            <Spinner />
        </Box>
    )
}

export default BaseSkeletonBox
