import BaseSkeletonBox from './BaseSkeletonBox'
import { Box } from 'grommet'

const FundingSkeleton = () => {
    return (
        <Box width="medium" gap="medium" align="center" pad={{ top: 'medium' }}>
            <BaseSkeletonBox height={'small'} width={'small'} />
            <BaseSkeletonBox height={'xsmall'} width={'small'} />
            <BaseSkeletonBox height={'small'} width={'medium'} />
        </Box>
    )
}

export default FundingSkeleton
