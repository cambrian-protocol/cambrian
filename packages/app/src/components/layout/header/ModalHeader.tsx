import { Box, Heading, Text } from 'grommet'

interface ModalHeaderProps {
    title: string
    metaInfo?: string
    description?: string
    icon?: JSX.Element
}

const ModalHeader = ({
    description,
    title,
    icon,
    metaInfo,
}: ModalHeaderProps) => {
    return (
        <Box pad={{ bottom: 'medium' }} height={{ min: 'auto' }}>
            <Box
                pad={{ bottom: 'medium' }}
                align="center"
                border={{ side: 'bottom' }}
                direction="row"
                wrap
            >
                <Box>
                    <Text color="brand">{metaInfo}</Text>
                    <Heading level="2">{title}</Heading>
                    <Text size="small" color="dark-4">
                        {description}
                    </Text>
                </Box>
            </Box>
        </Box>
    )
}

export default ModalHeader
