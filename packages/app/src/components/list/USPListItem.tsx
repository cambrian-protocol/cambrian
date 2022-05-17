import { Box } from 'grommet'
import { Heading } from 'grommet'
import { Text } from 'grommet'

interface USPListItemProps {
    title: string
    description: string
}

const USPListItem = ({ title, description }: USPListItemProps) => {
    return (
        <Box direction="row" pad={{ vertical: 'medium' }} align="center" wrap>
            <Box flex width={{ min: 'medium' }} pad="medium">
                <Heading level="2">{title}</Heading>
            </Box>
            <Box width={{ max: 'medium' }} pad="medium">
                <Text color="dark-4">{description}</Text>
            </Box>
        </Box>
    )
}

export default USPListItem
