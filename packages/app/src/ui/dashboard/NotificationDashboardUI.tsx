import { Box, Heading } from 'grommet'

import DashboardLayout from '@cambrian/app/components/layout/DashboardLayout'

interface NotificationDashboardUIProps {}

const NotificationDashboardUI = ({}: NotificationDashboardUIProps) => {
    return (
        <DashboardLayout contextTitle="Dashboard">
            <Box fill justify="center" align="center">
                <Heading>Notification</Heading>
            </Box>
        </DashboardLayout>
    )
}

export default NotificationDashboardUI
