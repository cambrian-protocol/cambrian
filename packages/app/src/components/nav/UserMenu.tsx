import { Box, Menu, Text } from 'grommet'
import { IconContext, SignIn, SignOut, UserCircle } from 'phosphor-react'

import React from 'react'
import RecipientAvatar from '../avatars/RecipientAvatar'
import { useRouter } from 'next/dist/client/router'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'

interface UserMenuProps {}

export default function UserMenu({}: UserMenuProps) {
    const { currentUser, logout } = useCurrentUser()
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
        <Menu
            dropAlign={{ left: 'right', top: 'bottom' }}
            dropProps={{
                round: {
                    corner: 'right',
                    size: 'small',
                },
            }}
            dropBackground="background-popup"
            items={[
                {
                    label: (
                        <UserMenuItemLabel
                            label={currentUser?.address || 'Profile'}
                        />
                    ),
                    onClick: onProfileClicked,
                    icon: <UserMenuItemIcon icon={<UserCircle />} />,
                },
                {
                    label: (
                        <UserMenuItemLabel
                            label={currentUser ? 'Logout' : 'Login'}
                        />
                    ),
                    onClick: onLogout,
                    icon: (
                        <UserMenuItemIcon
                            icon={currentUser ? <SignOut /> : <SignIn />}
                        />
                    ),
                },
            ]}
        >
            <IconContext.Provider value={{ size: '32' }}>
                <RecipientAvatar />
            </IconContext.Provider>
        </Menu>
    )
}

interface UserMenuItemLabelProps {
    label: string
}

const UserMenuItemLabel = ({ label }: UserMenuItemLabelProps) => {
    return (
        <Box alignSelf="center" pad={{ horizontal: 'medium' }} width="small">
            <Text truncate>{label}</Text>
        </Box>
    )
}

interface UserMenuItemIconProps {
    icon: JSX.Element
}

const UserMenuItemIcon = ({ icon }: UserMenuItemIconProps) => {
    return (
        <IconContext.Provider value={{ size: '24' }}>
            <Box pad="small">{icon}</Box>
        </IconContext.Provider>
    )
}
