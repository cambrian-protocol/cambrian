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
                round="small"
                width={'medium'}
                background="#280000"
                justify="around"
                align="center"
                style={{ position: 'relative' }}
            >
                <Box style={{ position: 'absolute', top: -80, right: -80 }}>
                    <IconContext.Provider
                        value={{ size: '256', opacity: 0.05 }}
                    >
                        {icon}
                    </IconContext.Provider>
                </Box>
                <Box gap="small">
                    <Text size="large" textAlign="center" weight={'bold'}>
                        {title}
                    </Text>
                    <Text textAlign="center">{description}</Text>
                </Box>
            </Card>
        </Box>
    )
}

export default USPCard
