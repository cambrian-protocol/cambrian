import { Box, Image } from 'grommet'

import { ArrowCircleRight } from 'phosphor-react'
import { Card } from 'grommet'
import Link from 'next/link'
import { Text } from 'grommet'

interface USPCardProps {
    image: string
    title: string
    description: string
    href: string
}

const USPCard = ({ image, title, description, href }: USPCardProps) => {
    return (
        <Box pad="medium">
            <Link href={href}>
                <Card
                    hoverIndicator={{ background: 'background-contrast-hover' }}
                    elevation="small"
                    pad={{ vertical: 'large', horizontal: 'medium' }}
                    round="xsmall"
                    height="medium"
                    width={'medium'}
                    background="background-contrast"
                    justify="around"
                    align="center"
                    gap="large"
                >
                    <Image src={image} height="100px" />
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
