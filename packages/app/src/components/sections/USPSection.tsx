import { Coins, MagnifyingGlass, UsersFour } from 'phosphor-react'

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
            <Box
                direction="row"
                justify="around"
                pad="small"
                wrap
                style={{ position: 'relative' }}
            >
                <USPCard
                    image="/illustrations/earn-together.svg"
                    title="Earn Together"
                    description="Publish your smart template in 5 minutes and sell your services or freelance skills"
                    href="https://cambrianprotocol.notion.site/What-are-Solvers-Cambrian-Dapps-7f0733edf51c4deab97118f475082c88"
                />
                <USPCard
                    image="/illustrations/build-together.svg"
                    title="Build Together"
                    description="Help us expand open, secure access to new labor markets for people worldwide"
                    href="https://cambrianprotocol.notion.site/Community-Ownership-85c3c3b76ffb40c5b099c23eb68e23c3"
                />
                <USPCard
                    image="/illustrations/work-together.svg"
                    title="WRK Together"
                    description="Learn how the WRK token shares ownership in the world's most important cooperative"
                    href="https://cambrianprotocol.notion.site/Incentive-Driven-Development-c7d8cb53f0ca42a9b21b8286477b9e0b"
                />
            </Box>
        </Box>
    )
}

export default USPSection
