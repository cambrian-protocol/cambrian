import { Box, ResponsiveContext, Text } from 'grommet'
import { ClipboardText, File, IconContext, TreeStructure } from 'phosphor-react'

import CambrianLogo from '../branding/CambrianLogo'
import CambrianLogoMark from '../branding/CambrianLogoMark'
import { Header } from 'grommet'
import Link from 'next/link'
import UserMenu from '../menu/UserMenu'
import { cpTheme } from '@cambrian/app/theme/theme'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'

const Appbar = () => {
    const { currentUser } = useCurrentUser()
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
                            align={screenSize === 'small' ? 'center' : 'end'}
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
                            {currentUser && (
                                <Box direction="row">
                                    <AppbarMenuItem
                                        pathname="/dashboard/templates"
                                        label="Templates"
                                        icon={<File />}
                                    />
                                    <AppbarMenuItem
                                        pathname="/dashboard/proposals"
                                        label="Proposals"
                                        icon={<ClipboardText />}
                                    />
                                    <AppbarMenuItem
                                        pathname="/dashboard/compositions"
                                        label="Compositions"
                                        icon={<TreeStructure />}
                                    />
                                </Box>
                            )}
                            <Box alignSelf="center" pad={{ left: 'large' }}>
                                <UserMenu />
                            </Box>
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
        <ResponsiveContext.Consumer>
            {(screenSize) => {
                return (
                    <Link href={pathname} passHref>
                        <Box
                            pad={{ vertical: 'small', horizontal: 'medium' }}
                            align="center"
                            focusIndicator={false}
                            gap="xsmall"
                        >
                            <IconContext.Provider
                                value={
                                    isActive
                                        ? { size: '24' }
                                        : {
                                              size: '24',
                                              color: cpTheme.global.colors[
                                                  'dark-4'
                                              ],
                                          }
                                }
                            >
                                {icon}
                            </IconContext.Provider>
                            {screenSize !== 'small' && (
                                <Text
                                    size="xsmall"
                                    color={isActive ? undefined : 'dark-4'}
                                >
                                    {label}
                                </Text>
                            )}
                        </Box>
                    </Link>
                )
            }}
        </ResponsiveContext.Consumer>
    )
}
