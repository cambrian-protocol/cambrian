import { Box, BoxProps, Spinner } from 'grommet'

type BaseSkeletonBoxProps = BoxProps & {
    showSpinner?: boolean
}

const BaseSkeletonBox = ({
    height,
    width,
    showSpinner,
}: BaseSkeletonBoxProps) => {
    return (
        <Box
            height={height}
            width={width}
            background={'background-skeleton'}
            round="xsmall"
            justify="center"
            align="center"
        >
            {showSpinner && <Spinner />}
        </Box>
    )
}

export default BaseSkeletonBox
