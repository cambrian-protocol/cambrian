import BaseSkeletonBox from './BaseSkeletonBox'
import { Box } from 'grommet'
import PlainSectionDivider from '../sections/PlainSectionDivider'

const ProposalSkeleton = () => {
    return (
        <Box height="large" gap="medium">
            <BaseSkeletonBox height={'xxsmall'} width={'100%'} />
            <BaseSkeletonBox height={'xsmall'} width={'100%'} />
            <PlainSectionDivider />
            <BaseSkeletonBox height={'small'} width={'100%'} />
            <BaseSkeletonBox height={'small'} width={'100%'} />
            <PlainSectionDivider />
            <Box direction="row" gap="medium">
                <BaseSkeletonBox height={'xsmall'} width={'xsmall'} />
                <BaseSkeletonBox height={'xsmall'} width={'50%'} />
            </Box>
        </Box>
    )
}

export default ProposalSkeleton
