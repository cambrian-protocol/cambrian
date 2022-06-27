import { Box, Text } from 'grommet'

interface CompositionHeaderProps {
    compositionTitle?: string
}

// TODO Styling
const CompositionHeader = ({ compositionTitle }: CompositionHeaderProps) => {
    return (
        <Box pad="small" border round="xsmall">
            <Text size="small" color="dark-4">
                Composition: {compositionTitle ? compositionTitle : 'Unknown'}
            </Text>
        </Box>
    )
}

export default CompositionHeader
