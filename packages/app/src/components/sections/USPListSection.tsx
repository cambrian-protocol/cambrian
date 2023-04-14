import { Box, Heading } from 'grommet'

import PlainSectionDivider from './PlainSectionDivider'
import USPListItem from '../list/USPListItem'

const USPListSection = () => {
    return (
        <Box height={{ min: '100vh' }} justify="center" align="center">
            <Heading level={'2'}>Introducing Cambrian Protocol:</Heading>
            <Heading>A New Era for Two-Sided Marketplaces</Heading>
            <Box width={'xlarge'} pad="large">
                <USPListItem
                    title="Solvers"
                    description="Programmable escrow contracts that enable seamless technical interoperability for transactions."
                />
                <PlainSectionDivider />
                <USPListItem
                    title="Web3 Integration"
                    description="Leveraging decentralized technologies to build a secure, transparent, and trustless marketplace."
                />
                <PlainSectionDivider />
                <USPListItem
                    title="AI-Powered Matching"
                    description="Using artificial intelligence to personalize matches and streamline information processing across platforms."
                />
                <PlainSectionDivider />
                <USPListItem
                    title="No-Code Web App"
                    description="A user-friendly platform that allows for easy Solver design, management, and collaboration."
                />
                <PlainSectionDivider />
                <USPListItem
                    title="Decentralized Data Storage"
                    description="Enhanced security and user privacy through Arbitrum and Ceramic integration."
                />
                <PlainSectionDivider />
                <USPListItem
                    title="Flexible & Customizable"
                    description="Adaptable to various use cases, industries, and individual needs."
                />
            </Box>
        </Box>
    )
}

export default USPListSection
