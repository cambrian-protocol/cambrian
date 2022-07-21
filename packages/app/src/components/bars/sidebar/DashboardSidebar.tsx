import {
    ChartBar,
    ClipboardText,
    File,
    TreeStructure,
    UserCircleGear,
} from 'phosphor-react'

import BaseListItemButton from '../../buttons/BaseListItemButton'
import { Box } from 'grommet'
import { useRouter } from 'next/router'

const dashboardRoutes = [
    {
        slug: '/dashboard',
        icon: <ChartBar />,
        label: 'Dashboard',
    },
    {
        slug: '/dashboard/proposals',
        icon: <ClipboardText />,
        label: 'Proposals',
    },
    {
        slug: '/dashboard/templates',
        icon: <File />,
        label: 'Templates',
    },
    {
        slug: '/dashboard/compositions',
        icon: <TreeStructure />,
        label: 'Compositions',
    },
    {
        slug: '/dashboard/profile',
        icon: <UserCircleGear />,
        label: 'Profile',
    },
]

const DashboardSidebar = () => {
    const router = useRouter()

    return (
        <Box
            fill
            width={{ min: 'medium' }}
            justify="between"
            pad={{ left: 'large', vertical: 'large' }}
        >
            <Box border={{ side: 'right' }} fill>
                {dashboardRoutes.map((dashboardRoute, idx) => (
                    <BaseListItemButton
                        key={idx}
                        hideDivider
                        icon={dashboardRoute.icon}
                        title={dashboardRoute.label}
                        isActive={router.pathname === dashboardRoute.slug}
                        onClick={() => router.push(dashboardRoute.slug)}
                    />
                ))}
            </Box>
        </Box>
    )
}

export default DashboardSidebar
