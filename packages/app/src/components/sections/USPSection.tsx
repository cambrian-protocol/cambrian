import { BoundingBox, Coins, ShareNetwork } from 'phosphor-react'

import { Box } from 'grommet'
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
            <Box
                direction="row"
                justify="around"
                pad="small"
                wrap
                style={{ position: 'relative' }}
            >
                <USPCard
                    icon={<Coins />}
                    title="Earn Together"
                    description="Publish your smart template in 5 minutes to start selling your services and skills"
                    href="https://cambrianprotocol.notion.site/Create-your-Freelance-Solver-13cd00c5ee6d42db900420eea97f4f74"
                />
                <USPCard
                    icon={<BoundingBox />}
                    title="Build Together"
                    description="Help us expand open, secure access to new labor markets for people worldwide"
                    href="https://cambrianprotocol.notion.site/Community-Ownership-85c3c3b76ffb40c5b099c23eb68e23c3"
                />
                <USPCard
                    icon={<ShareNetwork />}
                    title="WRK Together"
                    description="Learn how the WRK token shares ownership in the world's most important cooperative"
                    href="https://cambrianprotocol.notion.site/Incentive-Driven-Development-c7d8cb53f0ca42a9b21b8286477b9e0b"
                />
            </Box>
        </Box>
    )
}

export default USPSection
