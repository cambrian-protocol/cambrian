import {
    ArrowCircleRight,
    PuzzlePiece,
    ShareNetwork,
    UsersFour,
} from 'phosphor-react'

import { Anchor } from 'grommet'
import { Box } from 'grommet'
import Glow from '../branding/Glow'
import { Heading } from 'grommet'
import { Text } from 'grommet'
import USPCard from '../cards/USPCard'

const USPSection = () => {
    return (
        <Box
            height={{ min: '100vh' }}
            align="center"
            justify="center"
            style={{ position: 'relative', overflow: 'hidden' }}
            pad="large"
        >
            <Glow height="800px" width="2000px" left={'30%'} top={'10%'} />
            <Box gap="medium" align="center" style={{ position: 'relative' }}>
                <Heading textAlign="center">Turn-Key, Web 3</Heading>
                <Box width={'large'} gap="medium">
                    <Text color="dark-4" textAlign="center">
                        We're building a community to replace Big Tech's work
                        platforms and SaaS applications with blockchain
                        alternatives.
                    </Text>
                    <Anchor
                        color="brand"
                        href="https://www.notion.so/cambrianprotocol/Project-Description-97ba57659ed2421386065588ee052600"
                    >
                        <Box direction="row" gap="small" justify="center">
                            <Text>Check out our Notion</Text>
                            <ArrowCircleRight size="24" />
                        </Box>
                    </Anchor>
                </Box>
                <Box direction="row" justify="around" wrap>
                    <USPCard
                        icon={<PuzzlePiece />}
                        title="Service Puzzle pieces"
                        description="New forms of work by eliminating costs of trust, transfer and triangulation"
                        href="https://cambrianprotocol.notion.site/What-are-Solvers-Cambrian-Dapps-7f0733edf51c4deab97118f475082c88"
                    />
                    <USPCard
                        icon={<UsersFour />}
                        title="Community Ownership"
                        description="Open source software, decentralized ownership, and CambrianDAO"
                        href="https://cambrianprotocol.notion.site/Community-Ownership-85c3c3b76ffb40c5b099c23eb68e23c3"
                    />
                    <USPCard
                        icon={<ShareNetwork />}
                        title="Shared Incentives"
                        description="Three ways to earn aligning developers, entrepreneurs and crypto-enthusiasts"
                        href="https://cambrianprotocol.notion.site/Incentive-Driven-Development-c7d8cb53f0ca42a9b21b8286477b9e0b"
                    />
                </Box>
            </Box>
        </Box>
    )
}

export default USPSection
