import BaseSkeletonBox from './BaseSkeletonBox'
import { Box } from 'grommet'
import PlainSectionDivider from '../sections/PlainSectionDivider'

const ProposalSkeleton = () => {
    return (
        <Box height="large" pad="large" gap="medium">
            <BaseSkeletonBox height={'xxsmall'} width={'40%'} />
            <BaseSkeletonBox height={'xsmall'} width={'50%'} />
            <Box align="end">
                <BaseSkeletonBox height={'xxsmall'} width={'medium'} />
            </Box>
            <PlainSectionDivider />
            <BaseSkeletonBox height={'small'} width={'100%'} />
            <BaseSkeletonBox height={'small'} width={'90%'} />
            <PlainSectionDivider />
            <Box direction="row" gap="medium">
                <BaseSkeletonBox height={'xsmall'} width={'xsmall'} />
                <BaseSkeletonBox height={'xsmall'} width={'50%'} />
            </Box>
        </Box>
    )
}

export default ProposalSkeleton
