import { Box } from 'grommet'
import PlainSectionDivider from './PlainSectionDivider'
import USPListItem from '../list/USPListItem'

const USPListSection = () => {
    return (
        <Box height={{ min: '100vh' }} justify="center" align="center">
            <Box width={'xlarge'} pad="large">
                <USPListItem
                    title="Marketplace"
                    description="Find the perfect solution in our marketplace or create them yourself in our no-code environment"
                />
                <PlainSectionDivider />
                <USPListItem
                    title="Feature Rich"
                    description="Dapps built on our stack are seamlessly compatible with an ecosystem greater than the sum of its parts"
                />
                <PlainSectionDivider />
                <USPListItem
                    title="Decentralized"
                    description="Bring your own Gnosis Safe, keep your data on IPFS and use the management schemes that work for your organization"
                />
                <PlainSectionDivider />
                <USPListItem
                    title="Composable"
                    description="Quickly create full-feature solidity dapps compatible with a growing marketplace of solutions"
                />
                <PlainSectionDivider />
                <USPListItem
                    title="Opportunities"
                    description="Hire contractors, sell services and enforce contracts"
                />
            </Box>
        </Box>
    )
}

export default USPListSection
