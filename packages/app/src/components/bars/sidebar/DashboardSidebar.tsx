import {
    Bell,
    ClipboardText,
    File,
    Gear,
    House,
    PuzzlePiece,
    TreeStructure,
} from 'phosphor-react'

import BaseListItemButton from '../../buttons/BaseListItemButton'
import { Box } from 'grommet'
import { useRouter } from 'next/router'

const dashboardRoutes = [
    {
        slug: '/dashboard',
        icon: <House />,
        label: 'Dashboard',
    },
    {
        slug: '/dashboard/notification',
        icon: <Bell />,
        label: 'Notification',
        disabled: true,
    },
    {
        slug: '/dashboard/solvers',
        icon: <PuzzlePiece />,
        label: 'Solvers',
    },
    {
        slug: '/dashboard/templates',
        icon: <File />,
        label: 'Templates',
    },
    {
        slug: '/dashboard/proposals',
        icon: <ClipboardText />,
        label: 'Proposals',
    },
    {
        slug: '/dashboard/compositions',
        icon: <TreeStructure />,
        label: 'Compositions',
    },
    {
        slug: '/dashboard/settings',
        icon: <Gear />,
        label: 'Settings',
    },
]

const DashboardSidebar = () => {
    const router = useRouter()

    return (
        <Box fill width={{ min: 'medium' }} justify="between">
            <Box>
                {dashboardRoutes.map((dashboardRoute) => (
                    <BaseListItemButton
                        hideDivider
                        disabled={dashboardRoute.disabled}
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
