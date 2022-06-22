import { Box, Heading } from 'grommet'

import DashboardLayout from '@cambrian/app/components/layout/DashboardLayout'

interface SettingsDashboardUIProps {}

const SettingsDashboardUI = ({}: SettingsDashboardUIProps) => {
    return (
        <DashboardLayout contextTitle="Dashboard">
            <Box fill justify="center" align="center">
                <Heading>Settings</Heading>
            </Box>
        </DashboardLayout>
    )
}

export default SettingsDashboardUI
