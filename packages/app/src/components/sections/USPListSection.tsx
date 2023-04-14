import { Box, Heading, Image } from 'grommet'
import {
    Brain,
    CurrencyEth,
    Cursor,
    Palette,
    PuzzlePiece,
    ShareNetwork,
} from 'phosphor-react'

import PlainSectionDivider from './PlainSectionDivider'
import USPListItem from '../list/USPListItem'

const USPListSection = () => {
    return (
        <Box
            height={{ min: '100vh' }}
            justify="center"
            align="center"
            gap="medium"
        >
            <Box
                width={{
                    min: 'xsmall',
                    max: 'xsmall',
                }}
            >
                <Image
                    fit="contain"
                    fill
                    src="/images/logo/cambrian_protocol_logo.svg"
                />
            </Box>
            <Heading textAlign="center" level={'3'}>
                Introducing Cambrian Protocol:
            </Heading>
            <Heading textAlign="center">
                A New Era for Two-Sided Marketplaces
            </Heading>
            <Box width={'xlarge'} pad="large">
                <USPListItem
                    title="Solvers"
                    description="Programmable escrow contracts that enable seamless technical interoperability for transactions."
                    icon={<PuzzlePiece />}
                />
                <PlainSectionDivider />
                <USPListItem
                    title="Web3 Integration"
                    description="Leveraging decentralized technologies to build a secure, transparent, and trustless marketplace."
                    icon={<CurrencyEth />}
                />
                <PlainSectionDivider />
                <USPListItem
                    title="AI-Powered Matching"
                    description="Using artificial intelligence to personalize matches and streamline information processing across platforms."
                    icon={<Brain />}
                />
                <PlainSectionDivider />
                <USPListItem
                    title="No-Code Web App"
                    description="A user-friendly platform that allows for easy Solver design, management, and collaboration."
                    icon={<Cursor />}
                />
                <PlainSectionDivider />
                <USPListItem
                    title="Decentralized Data Storage"
                    description="Enhanced security and user privacy through Arbitrum and Ceramic integration."
                    icon={<ShareNetwork />}
                />
                <PlainSectionDivider />
                <USPListItem
                    title="Flexible & Customizable"
                    description="Adaptable to various use cases, industries, and individual needs."
                    icon={<Palette />}
                />
            </Box>
        </Box>
    )
}

export default USPListSection
