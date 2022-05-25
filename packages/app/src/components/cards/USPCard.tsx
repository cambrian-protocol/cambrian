import { ArrowCircleRight, IconContext } from 'phosphor-react'

import { Box } from 'grommet'
import { Card } from 'grommet'
import Link from 'next/link'
import { Text } from 'grommet'

interface USPCardProps {
    icon: JSX.Element
    title: string
    description: string
    href: string
}

const USPCard = ({ icon, title, description, href }: USPCardProps) => {
    return (
        <Box pad="medium">
            <Link href={href}>
                <Card
                    hoverIndicator={{ background: 'background-contrast-hover' }}
                    elevation="small"
                    pad={{ vertical: 'large', horizontal: 'medium' }}
                    round="small"
                    height="medium"
                    width={{ min: '20rem', max: '20rem' }}
                    background="background-contrast"
                    justify="around"
                    align="center"
                    gap="large"
                >
                    <IconContext.Provider
                        value={{
                            size: '48',
                        }}
                    >
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
                    <Box direction="row" gap="small">
                        <Text textAlign="center">Learn more</Text>
                        <ArrowCircleRight size="24" />
                    </Box>
                </Card>
            </Link>
        </Box>
    )
}

export default USPCard
