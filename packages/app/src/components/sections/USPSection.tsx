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
                <Heading textAlign="center">Zero Fees. Owned By You.</Heading>
                <Box width={'large'} gap="medium">
                    <Text color="dark-4" textAlign="center">
                        Say goodbye to invoices, wire transfers, freelancing
                        platforms and more. We build smart contracts that allow
                        anybody in the world to easily, securely work together.
                    </Text>
                    <Text color="dark-4" textAlign="center">
                        Cambrian Protocol is free forever, earning revenue with
                        value-added services and returning governance shares to
                        users who contribute optional payments back to the
                        community.
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
