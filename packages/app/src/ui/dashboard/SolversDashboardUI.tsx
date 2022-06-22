import { Box, Heading } from 'grommet'

import DashboardLayout from '@cambrian/app/components/layout/DashboardLayout'

interface SolversDashboardUIProps {}

const SolversDashboardUI = ({}: SolversDashboardUIProps) => {
    return (
        <DashboardLayout contextTitle="Dashboard">
            <Box fill justify="center" align="center">
                <Heading>Solvers</Heading>
            </Box>
        </DashboardLayout>
    )
}

export default SolversDashboardUI
