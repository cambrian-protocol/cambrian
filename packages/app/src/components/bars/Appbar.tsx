import { Box, Button, ResponsiveContext } from 'grommet'
import { IconContext, Layout } from 'phosphor-react'

import CambrianLogo from '../branding/CambrianLogo'
import CambrianLogoMark from '../branding/CambrianLogoMark'
import { Header } from 'grommet'
import Link from 'next/link'
import UserMenu from '../menu/UserMenu'
import { cpTheme } from '@cambrian/app/theme/theme'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'

interface AppbarProps {
    injectedWalletAddress?: string
}

const Appbar = ({ injectedWalletAddress }: AppbarProps) => {
    const { currentUser } = useCurrentUserContext()

    return (
        <ResponsiveContext.Consumer>
            {(screenSize) => {
                return (
                    <Header
                        sticky="scrollup"
                        pad={{ horizontal: 'large' }}
                        background="background-back"
                        fill="horizontal"
                    >
                        <Box
                            style={{ position: 'relative' }}
                            border={{ side: 'bottom' }}
                            direction="row"
                            flex
                            justify="between"
                            gap="medium"
                        >
                            {screenSize === 'small' ? (
                                <Box pad={{ vertical: 'medium' }}>
                                    <CambrianLogoMark />
                                </Box>
                            ) : (
                                <CambrianLogo />
                            )}
                            <Box flex />
                            {currentUser &&
                                injectedWalletAddress === undefined && (
                                    <Box justify={'center'}>
                                        <AppbarMenuItem
                                            pathname="/dashboard"
                                            label="Dashboard"
                                            icon={<Layout />}
                                        />
                                    </Box>
                                )}
                            <UserMenu
                                injectedWalletAddress={injectedWalletAddress}
                            />
                        </Box>
                    </Header>
                )
            }}
        </ResponsiveContext.Consumer>
    )
}

export default Appbar

interface AppbarMenuItemProps {
    pathname: string
    label: string
    icon: JSX.Element
}

const AppbarMenuItem = ({ icon, pathname, label }: AppbarMenuItemProps) => {
    let isActive = false
    if (typeof window !== 'undefined') {
        isActive = window.location.pathname === pathname
    }

    return (
        <IconContext.Provider
            value={
                isActive
                    ? { size: '24' }
                    : {
                          size: '24',
                          color: cpTheme.global.colors['dark-4'],
                      }
            }
        >
            <Link href={pathname} passHref>
                <Button icon={icon} tip={label} active={isActive} />
            </Link>
        </IconContext.Provider>
    )
}
