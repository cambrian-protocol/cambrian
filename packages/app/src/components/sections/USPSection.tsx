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
                <Box width={'large'} gap="xlarge">
                    <Box width={'large'} gap="medium">
                        <Heading textAlign="start">Choice & Control</Heading>
                        <Text
                            color="dark-4"
                            textAlign="start"
                            style={{ whiteSpace: 'pre-line' }}
                        >
                            Banks control your money.{'\n'}
                            Government controls your identity.{'\n'}
                            Tech companies control your information.{'\n'}
                            You pay taxes and fees to use what's already yours.
                        </Text>
                        <Text
                            color="dark-4"
                            textAlign="start"
                            style={{ whiteSpace: 'pre-line' }}
                        >
                            Cambrian users are empowered by blockchain
                            technology to manage their own identities, operate
                            using the currencies of their choice, and leverage a
                            growing suite of information technologies for their
                            work and business — Without paying middlemen for
                            their monopolies.
                        </Text>
                    </Box>

                    <Box width={'large'} gap="medium">
                        <Heading textAlign="start">Freedom & Stability</Heading>
                        <Text
                            color="dark-4"
                            textAlign="start"
                            style={{ whiteSpace: 'pre-line' }}
                        >
                            Thousands of livelihoods disappear every day from
                            censorship, deplatforming, and simple mistakes. Your
                            access to the financial services and digital
                            platforms you need is at constant risk of being shut
                            off.
                        </Text>
                        <Text
                            color="dark-4"
                            textAlign="start"
                            style={{ whiteSpace: 'pre-line' }}
                        >
                            Our technology is built on Ethereum, the world's
                            leading smart contract network. Our software is kept
                            running by thousands of independent operators around
                            the world, making downtime and censorship next to
                            impossible. Even we can't ban you.
                        </Text>
                    </Box>

                    <Box width={'large'} gap="medium">
                        <Heading textAlign="start">
                            Consensus & Cooperation
                        </Heading>
                        <Text
                            color="dark-4"
                            textAlign="start"
                            style={{ whiteSpace: 'pre-line' }}
                        >
                            Misalignment between the owning and working class
                            breeds exploitative conditions and unsustainable
                            business practices. The future of work should be
                            owned by the workers.
                        </Text>
                        <Text
                            color="dark-4"
                            textAlign="start"
                            style={{ whiteSpace: 'pre-line' }}
                        >
                            Cambrian is establishing a Decentralized Autonomous
                            Organization (DAO), an evolution of the platform
                            cooperative, to own and govern the protocol. Our
                            founding team will dissolve into the DAO,
                            transferring our intellectual property and exiting
                            to the community.
                        </Text>
                    </Box>

                    <Box width={'large'} gap="medium">
                        <Heading textAlign="start">
                            Extensible & Customizable
                        </Heading>
                        <Text
                            color="dark-4"
                            textAlign="start"
                            style={{ whiteSpace: 'pre-line' }}
                        >
                            The world moves too fast for one solution, and no
                            software is right for everyone. The future of work
                            needs something better than generic escrow and
                            bounty solutions.
                        </Text>
                        <Text
                            color="dark-4"
                            textAlign="start"
                            style={{ whiteSpace: 'pre-line' }}
                        >
                            Our Solver technology is modular, composable, and
                            easily extended by developers. More, we've built an
                            entire no-code workflow for regular users to
                            configure custom solutions — eliminating engineering
                            as a bottleneck to growth and adoption.
                        </Text>
                    </Box>
                </Box>

                <Box direction="row" justify="around" pad="large" wrap>
                    <USPCard
                        icon={<Coins />}
                        title="Earn Together"
                        description="Publish your smart template in 5 minutes and sell your services or freelance skills"
                        href="https://cambrianprotocol.notion.site/What-are-Solvers-Cambrian-Dapps-7f0733edf51c4deab97118f475082c88"
                    />
                    <USPCard
                        icon={<UsersFour />}
                        title="Build Together"
                        description="Help us expand open, secure access to new labor markets for people worldwide"
                        href="https://cambrianprotocol.notion.site/Community-Ownership-85c3c3b76ffb40c5b099c23eb68e23c3"
                    />
                    <USPCard
                        icon={<MagnifyingGlass />}
                        title="WRK Together"
                        description="Learn how the WRK token shares ownership in the world's most important cooperative"
                        href="https://cambrianprotocol.notion.site/Incentive-Driven-Development-c7d8cb53f0ca42a9b21b8286477b9e0b"
                    />
                </Box>
            </Box>
        </Box>
    )
}

export default USPSection
