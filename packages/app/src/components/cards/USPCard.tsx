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
                <a
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'none' }}
                >
                    <Card
                        hoverIndicator={{ background: 'background-contrast' }}
                        elevation="small"
                        pad={{ vertical: 'large', horizontal: 'medium' }}
                        round="xsmall"
                        height="medium"
                        width={'medium'}
                        background="background-back"
                        border
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
                        <Box direction="row" gap="small">
                            <Text textAlign="center">Learn more</Text>
                            <ArrowCircleRight size="24" />
                        </Box>
                    </Card>
                </a>
            </Link>
        </Box>
    )
}

export default USPCard
