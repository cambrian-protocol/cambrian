import { Box } from 'grommet'
import { CardHeader } from 'grommet'
import { Text } from 'grommet'

interface SidebarCardHeaderProps {
    title?: string
    info?: string
}

const SidebarCardHeader = ({ title, info }: SidebarCardHeaderProps) => {
    return (
        <CardHeader pad={'medium'} elevation="small">
            <Box direction="row" justify="between" fill={'horizontal'}>
                <Text>{title}</Text>
                <Text color="dark-4">{info}</Text>
            </Box>
        </CardHeader>
    )
}

export default SidebarCardHeader
