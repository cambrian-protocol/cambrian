import {
    ChartBar,
    ClipboardText,
    File,
    PuzzlePiece,
    Storefront,
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
        slug: '/dashboard/marketplace',
        icon: <Storefront />,
        label: 'Marketplace',
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
