import { Box, ResponsiveContext } from 'grommet'

import AppbarMenuItem from './appbar/AppbarMenuItem'
import CambrianLogo from '../branding/CambrianLogo'
import CambrianLogoMark from '../branding/CambrianLogoMark'
import ChainMenu from './appbar/ChainMenu'
import { Header } from 'grommet'
import { Layout } from 'phosphor-react'
import UserMenu from '../menu/UserMenu'
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
                                    <Box direction="row" gap="medium">
                                        <Box justify="center">
                                            <AppbarMenuItem
                                                pathname="/dashboard"
                                                label="Dashboard"
                                                icon={<Layout />}
                                            />
                                        </Box>
                                        <ChainMenu currentUser={currentUser} />
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
