import { Box, Heading } from 'grommet'

import DashboardLayout from '@cambrian/app/components/layout/DashboardLayout'

interface CompositionsDashboardUIProps {}

const CompositionsDashboardUI = ({}: CompositionsDashboardUIProps) => {
    return (
        <DashboardLayout contextTitle="Dashboard">
            <Box fill justify="center" align="center">
                <Heading>Compositions</Heading>
            </Box>
        </DashboardLayout>
    )
}

export default CompositionsDashboardUI
