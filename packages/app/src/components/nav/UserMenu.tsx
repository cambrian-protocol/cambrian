import {
    Books,
    IconContext,
    Question,
    SignIn,
    SignOut,
    Wallet,
} from 'phosphor-react'
import { Box, Menu, Text } from 'grommet'

import BaseAvatar from '../avatars/BaseAvatar'
import React from 'react'
import { SUPPORTED_CHAINS } from 'packages/app/config/SupportedChains'
import { ellipseAddress } from '@cambrian/app/utils/helpers/ellipseAddress'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'

interface UserMenuProps {}

export default function UserMenu({}: UserMenuProps) {
    const { currentUser, disconnectWallet, connectWallet } = useCurrentUser()

    let chainName = 'Chain not supported'

    if (currentUser.chainId && SUPPORTED_CHAINS[currentUser.chainId]) {
        chainName = SUPPORTED_CHAINS[currentUser.chainId].chainData.name
    }

    const menuItems: {}[] = [
        {
            label: <UserMenuItemLabel label="Learn" />,
            icon: <UserMenuItemIcon icon={<Books />} />,
            href: 'https://www.notion.so/cambrianprotocol/Cambrian-Protocol-Wiki-24613f0f7cdb4b32b3f7900915740a70',
        },
        {
            label: <UserMenuItemLabel label="Support" />,
            icon: <UserMenuItemIcon icon={<Question />} />,
            href: 'https://discord.com/channels/856113492348108882/968295116576026625',
        },
    ]

    if (currentUser.address && currentUser.chainId) {
        menuItems.unshift({
            label: (
                <UserMenuItemLabel
                    subTitle={chainName}
                    label={ellipseAddress(currentUser.address, 9)}
                />
            ),
            icon: <UserMenuItemIcon icon={<Wallet />} />,
        })
        menuItems.push({
            label: (
                <UserMenuItemLabel label={currentUser ? 'Logout' : 'Login'} />
            ),
            onClick: disconnectWallet,
            icon: (
                <UserMenuItemIcon
                    icon={currentUser ? <SignOut /> : <SignIn />}
                />
            ),
        })
    } else {
        menuItems.unshift({
            label: (
                <UserMenuItemLabel
                    label={currentUser?.address || 'Connect Wallet'}
                />
            ),
            onClick: connectWallet,
            icon: <UserMenuItemIcon icon={<Wallet />} />,
        })
    }

    return (
        <Menu
            dropAlign={{ top: 'bottom', right: 'right' }}
            dropProps={{
                round: {
                    corner: 'bottom',
                    size: 'small',
                },
            }}
            dropBackground="background-popup"
            items={menuItems}
        >
            <BaseAvatar icon={<Wallet />} address={currentUser.address} />
        </Menu>
    )
}

interface UserMenuItemLabelProps {
    subTitle?: string
    label: string
}

const UserMenuItemLabel = ({ subTitle, label }: UserMenuItemLabelProps) => {
    return (
        <Box alignSelf="center" pad={{ horizontal: 'medium' }} width="medium">
            {subTitle && (
                <Text size="xsmall" color="dark-4">
                    {subTitle}
                </Text>
            )}
            <Text>{label}</Text>
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
