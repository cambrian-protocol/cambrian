import { Box, Heading, Text } from 'grommet'
import { IconContext } from 'phosphor-react'

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
                gap="small"
                pad={{ bottom: 'medium' }}
                align="center"
                border={{ side: 'bottom' }}
            >
                <IconContext.Provider value={{ size: '32' }}>
                    {icon}
                </IconContext.Provider>
                <Box>
                    <Text color="brand" textAlign="center">
                        {metaInfo}
                    </Text>
                    <Heading level="2" textAlign="center">
                        {title}
                    </Heading>
                </Box>
                <Text textAlign="center" size="small" color="dark-4">
                    {description}
                </Text>
            </Box>
        </Box>
    )
}

export default ModalHeader
