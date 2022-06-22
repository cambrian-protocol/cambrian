import {
    Bell,
    Books,
    HouseLine,
    Question,
    SignIn,
    SignOut,
    Wallet,
} from 'phosphor-react'
import {
    SUPPORT_DISCORD_LINK,
    WIKI_NOTION_LINK,
} from 'packages/app/config/ExternalLinks'

import BaseAvatar from '../avatars/BaseAvatar'
import { Menu } from 'grommet'
import React from 'react'
import { SUPPORTED_CHAINS } from 'packages/app/config/SupportedChains'
import UserMenuItemIcon from './UserMenuItemIcon'
import UserMenuItemLabel from './UserMenuItemLabel'
import { ellipseAddress } from '@cambrian/app/utils/helpers/ellipseAddress'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'

export default function UserMenu() {
    const { currentUser, disconnectWallet, connectWallet } = useCurrentUser()

    let chainName = 'Chain not supported'

    if (currentUser && SUPPORTED_CHAINS[currentUser.chainId]) {
        chainName = SUPPORTED_CHAINS[currentUser.chainId].chainData.name
    }

    const menuItems: {}[] = [
        {
            label: <UserMenuItemLabel label="Learn" />,
            icon: <UserMenuItemIcon icon={<Books />} />,
            href: WIKI_NOTION_LINK,
        },
        {
            label: <UserMenuItemLabel label="Support" />,
            icon: <UserMenuItemIcon icon={<Question />} />,
            href: SUPPORT_DISCORD_LINK,
        },
    ]

    if (currentUser) {
        menuItems.unshift({
            label: <UserMenuItemLabel label="Notification" />,
            icon: <UserMenuItemIcon icon={<Bell />} />,
            href: '/dashboard/notification',
            disabled: true,
        })
        menuItems.unshift({
            label: (
                <UserMenuItemLabel
                    subTitle={chainName}
                    label={ellipseAddress(currentUser.address, 9)}
                />
            ),
            icon: <UserMenuItemIcon icon={<Wallet />} />,
        })
        menuItems.unshift({
            label: <UserMenuItemLabel label="Dashboard" />,
            icon: <UserMenuItemIcon icon={<HouseLine />} />,
            href: '/dashboard',
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
            label: <UserMenuItemLabel label={'Connect Wallet'} />,
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
            <BaseAvatar
                icon={<Wallet />}
                address={currentUser ? currentUser.address : undefined}
            />
        </Menu>
    )
}
