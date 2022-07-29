import BaseSkeletonBox from './BaseSkeletonBox'
import { Box } from 'grommet'
import PlainSectionDivider from '../sections/PlainSectionDivider'

const TemplateSkeleton = () => {
    return (
        <Box gap="medium">
            <BaseSkeletonBox height={'xxsmall'} />
            <PlainSectionDivider />
            <BaseSkeletonBox height={'medium'} />
            <PlainSectionDivider />
            <BaseSkeletonBox height={'small'} />
            <PlainSectionDivider />
            <BaseSkeletonBox height={'small'} />
        </Box>
    )
}

export default TemplateSkeleton
