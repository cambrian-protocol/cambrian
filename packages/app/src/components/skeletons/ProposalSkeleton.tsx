import { Box, Spinner } from 'grommet'

// WIP
const ProposalSkeleton = () => {
    return (
        <Box height="large" pad="large" gap="medium">
            <Box
                background={'background-contrast-hover'}
                round="xsmall"
                height={'small'}
                style={{ opacity: '0.5' }}
                justify="center"
                align="center"
            >
                <Spinner />
            </Box>
            <Box
                background={'background-contrast-hover'}
                fill
                round="xsmall"
                height={'medium'}
                style={{ opacity: '0.5' }}
                justify="center"
                align="center"
            >
                <Spinner />
            </Box>
            <Box
                background={'background-contrast-hover'}
                round="xsmall"
                height={'small'}
                style={{ opacity: '0.5' }}
                justify="center"
                align="center"
            >
                <Spinner />
            </Box>
            <Box
                background={'background-contrast-hover'}
                round="xsmall"
                height={'small'}
                style={{ opacity: '0.5' }}
                justify="center"
                align="center"
            >
                <Spinner />
            </Box>
        </Box>
    )
}

export default ProposalSkeleton
