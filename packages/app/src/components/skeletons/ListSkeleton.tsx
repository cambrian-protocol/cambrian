import { Box, Spinner, Text } from 'grommet'

import { CircleDashed } from 'phosphor-react'
import { cpTheme } from '@cambrian/app/theme/theme'

interface ListSkeletonProps {
    isFetching: boolean
    subject: string
}

const ListSkeleton = ({ isFetching, subject }: ListSkeletonProps) => {
    return (
        <Box
            fill
            justify="center"
            align="center"
            round="xsmall"
            border
            height={{ min: 'small' }}
        >
            {isFetching ? (
                <Spinner />
            ) : (
                <Box direction="row" gap="small">
                    <CircleDashed color={cpTheme.global.colors['dark-4']} />
                    <Text size="small" color="dark-4">
                        No {subject} found
                    </Text>
                </Box>
            )}
        </Box>
    )
}

export default ListSkeleton
