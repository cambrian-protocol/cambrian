import { Box, Text } from 'grommet'

interface CompositionHeaderProps {
    compositionID?: string
    streamID?: string
}

const CompositionHeader = ({
    compositionID,
    streamID,
}: CompositionHeaderProps) => {
    return (
        <Box pad="small" border round="xsmall">
            <Text size="small" color="dark-4">
                Composition Name: {compositionID ? compositionID : 'Unknown'}
            </Text>
            <Text size="small" color="dark-4" truncate>
                IPFS Link: {streamID ? streamID : 'Unknown'}
            </Text>
        </Box>
    )
}

export default CompositionHeader
