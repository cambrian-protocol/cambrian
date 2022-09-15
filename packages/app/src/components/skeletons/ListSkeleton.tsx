import { Box, Text } from 'grommet'

import BaseSkeletonBox from './BaseSkeletonBox'
import { CircleDashed } from 'phosphor-react'
import { cpTheme } from '@cambrian/app/theme/theme'

interface ListSkeletonProps {
    isFetching: boolean
    subject: string
}

const ListSkeleton = ({ isFetching, subject }: ListSkeletonProps) => {
    return (
        <>
            {isFetching ? (
                <Box gap="small">
                    <BaseSkeletonBox height={'xsmall'} width={'100%'} />
                    <BaseSkeletonBox height={'xsmall'} width={'100%'} />
                    <BaseSkeletonBox height={'xsmall'} width={'100%'} />
                </Box>
            ) : (
                <Box
                    direction="row"
                    gap="small"
                    border
                    height={{ min: 'xsmall' }}
                    justify="center"
                    align="center"
                    round="xsmall"
                >
                    <CircleDashed color={cpTheme.global.colors['dark-4']} />
                    <Text size="small" color="dark-4">
                        No {subject} found
                    </Text>
                </Box>
            )}
        </>
    )
}

export default ListSkeleton
