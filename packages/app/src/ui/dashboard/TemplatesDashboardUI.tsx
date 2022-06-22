import { Box, Heading } from 'grommet'

import DashboardLayout from '@cambrian/app/components/layout/DashboardLayout'

interface TemplatesDashboardUIProps {}

const TemplatesDashboardUI = ({}: TemplatesDashboardUIProps) => {
    return (
        <DashboardLayout contextTitle="Dashboard">
            <Box fill justify="center" align="center">
                <Heading>Templates</Heading>
            </Box>
        </DashboardLayout>
    )
}

export default TemplatesDashboardUI
