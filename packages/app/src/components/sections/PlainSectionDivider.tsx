import { Box, BoxProps } from 'grommet'

const PlainSectionDivider = (props: BoxProps) => (
    <Box {...props} height={{ min: '1px', max: '1px' }} background="dark-3" />
)

export default PlainSectionDivider
