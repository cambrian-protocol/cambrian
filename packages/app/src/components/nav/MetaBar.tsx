import { Box, Image, Menu, Nav, Text } from 'grommet'
import {
    CurrencyEth,
    IconContext,
    SignIn,
    SignOut,
    UserCircle,
} from 'phosphor-react'

import React from 'react'
import styled from 'styled-components'
import { useCurrentUserOrSigner } from '@cambrian/app/hooks/useCurrentUserOrSigner'
import { useRouter } from 'next/dist/client/router'

const PositionedNav = styled(Nav)`
    position: sticky;
    top: 0;
    left: 0;
    z-index: 110;
`

const MetaBar = () => {
    const { currentUser, logout } = useCurrentUserOrSigner()
    const router = useRouter()

    const onLogout = () => {
        logout()
        router.push('/auth/login')
    }

    //TODO Display Profile Page if User is connected - no prio
    const onProfileClicked = () => {
        if (!currentUser) router.push('/auth/login')
    }

    return (
        <PositionedNav
            direction="row"
            background="darkBlue"
            width="100%"
            tag="header"
        >
            <Box pad="small" direction="row" gap="small" align="center">
                <Box
                    pad="xsmall"
                    height={{ min: 'xxsmall', max: 'xxsmall' }}
                    width={{ min: 'xxsmall', max: 'xxsmall' }}
                >
                    <Image src="/images/cambrian_protocol_logo_400x400.png" />
                </Box>

                <Box direction="row" gap="small">
                    <Text weight="bold">Cambrian Protocol</Text>
                    <Text size="xsmall">BETA</Text>
                </Box>
            </Box>
            <Box flex />
            <Menu
                dropAlign={{ top: 'bottom', right: 'right' }}
                dropProps={{
                    round: { corner: 'bottom-left', size: 'small' },
                    elevation: 'none',
                }}
                dropBackground="veryDark"
                items={[
                    {
                        label: (
                            <MetaMenuItemLabel
                                label={currentUser?.address || 'Profile'}
                            />
                        ),
                        onClick: onProfileClicked,
                        icon: <MetaMenuItemIcon icon={<UserCircle />} />,
                    },
                    {
                        label: (
                            <MetaMenuItemLabel
                                label={currentUser ? 'Logout' : 'Login'}
                            />
                        ),
                        onClick: onLogout,
                        icon: (
                            <MetaMenuItemIcon
                                icon={currentUser ? <SignOut /> : <SignIn />}
                            />
                        ),
                    },
                ]}
            >
                <IconContext.Provider value={{ size: '32' }}>
                    <Box pad="small">
                        {currentUser ? (
                            <CurrencyEth color={currentUser.color} />
                        ) : (
                            <UserCircle />
                        )}
                    </Box>
                </IconContext.Provider>
            </Menu>
        </PositionedNav>
    )
}

export default MetaBar

interface MetaMenuItemLabelProps {
    label: string
}

const MetaMenuItemLabel = ({ label }: MetaMenuItemLabelProps) => {
    return (
        <Box alignSelf="center" pad={{ horizontal: 'medium' }} width="small">
            <Text weight="bold" size="small" truncate>
                {label}
            </Text>
        </Box>
    )
}

interface MetaMenuItemIconProps {
    icon: JSX.Element
}

const MetaMenuItemIcon = ({ icon }: MetaMenuItemIconProps) => {
    return (
        <IconContext.Provider value={{ size: '24' }}>
            <Box pad="small">{icon}</Box>
        </IconContext.Provider>
    )
}
