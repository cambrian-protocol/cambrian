import { Box, Heading } from 'grommet'
import { Database, ShareNetwork, UsersFour } from 'phosphor-react'

import FadeIn from '@cambrian/app/animations/FadeIn'
import USPCard from '../cards/USPCard'

const PainPointSection = () => {
    return (
        <Box
            height={{ min: '100vh' }}
            align="center"
            justify="center"
            style={{ position: 'relative', overflow: 'hidden' }}
            pad="large"
            gap="large"
        >
            <Box align="center" gap="small">
                <Heading textAlign="center" level={'3'}>
                    Navigating the
                </Heading>
                <Heading textAlign="center">
                    Two-Sided Marketplace Landscape
                </Heading>
            </Box>
            <Box
                direction="row"
                justify="around"
                pad="small"
                wrap
                style={{ position: 'relative' }}
            >
                <FadeIn direction="X" distance="-5%">
                    <USPCard
                        icon={
                            <Box direction="row">
                                <ShareNetwork />
                                <ShareNetwork
                                    style={{ transform: 'scaleX(-1)' }}
                                />
                            </Box>
                        }
                        title="Limited Interoperability"
                        description="Traditional marketplaces often struggle to connect various platforms, protocols, and systems, leading to inefficiencies and missed opportunities."
                    />
                </FadeIn>
                <FadeIn direction="Y" distance="0%">
                    <USPCard
                        icon={<Database />}
                        title="Information Silos"
                        description="Data and knowledge remain isolated, making it difficult for businesses and freelancers to access and leverage valuable insights"
                    />
                </FadeIn>
                <FadeIn direction="X" distance="5%">
                    <USPCard
                        icon={<UsersFour />}
                        title="Lack of Personalization"
                        description="Traditional marketplaces often fail to tailor experiences to individual users' needs, resulting in less effective matches and lower user satisfaction"
                    />
                </FadeIn>
            </Box>
        </Box>
    )
}

export default PainPointSection
