import { UsersFour, Coins, MagnifyingGlass } from 'phosphor-react'

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
            <Glow height="800px" width="2000px" left={'40%'} top={'10%'} />
            <Box gap="medium" align="center" style={{ position: 'relative' }}>
                <Heading textAlign="center">Start Earning Now</Heading>
                <Box width={'large'} gap="medium">
                    <Text color="dark-4" textAlign="center">
                        Publish a smart template to field proposals from
                        customers and bounty hunters. Administer contracts using
                        powerful "Solver" dapps with secure escrow and
                        centralized or decentralized management and arbitration.
                    </Text>
                    {/* <Anchor
                        color="brand"
                        href="https://www.notion.so/cambrianprotocol/Project-Description-97ba57659ed2421386065588ee052600"
                    >
                        <Box direction="row" gap="small" justify="center">
                            <Text>Check out our Notion</Text>
                            <ArrowCircleRight size="24" />
                        </Box>
                    </Anchor> */}
                </Box>
                <Box direction="row" justify="around" wrap>
                    <USPCard
                        icon={<Coins />}
                        title="Sell Services"
                        description="Publish your smart template in 5 minutes and sell your services or freelance skills"
                        href="https://cambrianprotocol.notion.site/What-are-Solvers-Cambrian-Dapps-7f0733edf51c4deab97118f475082c88"
                    />
                    <USPCard
                        icon={<UsersFour />}
                        title="Post Bounties"
                        description="Tap into a global community of talent with trust-minimized, secure bounties"
                        href="https://cambrianprotocol.notion.site/Community-Ownership-85c3c3b76ffb40c5b099c23eb68e23c3"
                    />
                    <USPCard
                        icon={<MagnifyingGlass />}
                        title="Explore Listings"
                        description="Discover services and job opportunities exclusive to Web3"
                        href="https://cambrianprotocol.notion.site/Incentive-Driven-Development-c7d8cb53f0ca42a9b21b8286477b9e0b"
                    />
                </Box>
            </Box>
        </Box>
    )
}

export default USPSection
