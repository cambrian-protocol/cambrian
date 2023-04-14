import { Box } from 'grommet'
import { Card } from 'grommet'
import { IconContext } from 'phosphor-react'
import { Text } from 'grommet'

interface USPCardProps {
    icon: JSX.Element
    title: string
    description: string
}

const USPCard = ({ icon, title, description }: USPCardProps) => {
    return (
        <Box pad="medium">
            <Card
                elevation="small"
                pad={{ vertical: 'large', horizontal: 'medium' }}
                round="xsmall"
                height="medium"
                width={'medium'}
                background="background-back"
                border={{ color: '#280000', size: 'small' }}
                justify="around"
                align="center"
                gap="large"
            >
                <IconContext.Provider value={{ size: '48' }}>
                    {icon}
                </IconContext.Provider>
                <Box gap="small">
                    <Text size="large" textAlign="center">
                        {title}
                    </Text>
                    <Text textAlign="center" color="dark-4">
                        {description}
                    </Text>
                </Box>
            </Card>
        </Box>
    )
}

export default USPCard
