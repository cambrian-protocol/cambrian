import { Box, Heading } from 'grommet'

import DashboardLayout from '@cambrian/app/components/layout/DashboardLayout'

interface ProposalsDashboardUIProps {}

const ProposalsDashboardUI = ({}: ProposalsDashboardUIProps) => {
    return (
        <DashboardLayout contextTitle="Dashboard">
            <Box fill justify="center" align="center">
                <Heading>Proposals</Heading>
            </Box>
        </DashboardLayout>
    )
}

export default ProposalsDashboardUI
