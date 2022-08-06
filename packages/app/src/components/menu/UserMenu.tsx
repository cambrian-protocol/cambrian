import { Books, Question, SignIn, SignOut, User, Wallet } from 'phosphor-react'
import {
    SUPPORT_DISCORD_LINK,
    WIKI_NOTION_LINK,
} from 'packages/app/config/ExternalLinks'

import BaseAvatar from '../avatars/BaseAvatar'
import { Menu } from 'grommet'
import React from 'react'
import UserMenuItemIcon from './UserMenuItemIcon'
import UserMenuItemLabel from './UserMenuItemLabel'
import { ellipseAddress } from '@cambrian/app/utils/helpers/ellipseAddress'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'

export default function UserMenu() {
    const { currentUser, disconnectWallet, connectWallet } =
        useCurrentUserContext()

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
            label: (
                <UserMenuItemLabel
                    subTitle={ellipseAddress(currentUser.address, 9)}
                    label={
                        currentUser.cambrianProfileDoc.content?.name || 'Anonym'
                    }
                />
            ),
            icon: <UserMenuItemIcon icon={<User />} />,
            href: '/dashboard/profile',
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
            {currentUser ? (
                currentUser.cambrianProfileDoc.content?.avatar ? (
                    <BaseAvatar
                        pfpPath={
                            currentUser.cambrianProfileDoc.content
                                .avatar as string
                        }
                    />
                ) : (
                    <BaseAvatar address={currentUser.address} />
                )
            ) : (
                <BaseAvatar icon={<Wallet />} />
            )}
        </Menu>
    )
}
