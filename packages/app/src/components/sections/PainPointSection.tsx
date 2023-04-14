import { Box, Heading } from 'grommet'
import {
    Database,
    Gear,
    MinusCircle,
    Prohibit,
    Stamp,
    UsersFour,
} from 'phosphor-react'

import StackedIcon from '../icons/StackedIcon'
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
            <Heading>Navigating the Two-Sided Marketplace Landscape</Heading>
            <Box
                direction="row"
                justify="around"
                pad="small"
                wrap
                style={{ position: 'relative' }}
            >
                <USPCard
                    icon={
                        <StackedIcon
                            icon={<Gear />}
                            stackedIcon={<MinusCircle color="red" />}
                        />
                    }
                    title="Limited Interoperability"
                    description="Traditional marketplaces often struggle to connect various platforms, protocols, and systems, leading to inefficiencies and missed opportunities."
                />
                <USPCard
                    icon={
                        <StackedIcon
                            icon={<Database />}
                            stackedIcon={<Prohibit color="red" />}
                        />
                    }
                    title="Information Silos"
                    description="Data and knowledge remain isolated, making it difficult for businesses and freelancers to access and leverage valuable insights"
                />
                <USPCard
                    icon={
                        <StackedIcon
                            icon={<UsersFour />}
                            stackedIcon={<Stamp color="red" />}
                        />
                    }
                    title="Lack of Personalization"
                    description="Traditional marketplaces often fail to tailor experiences to individual users' needs, resulting in less effective matches and lower user satisfaction"
                />
            </Box>
        </Box>
    )
}

export default PainPointSection
