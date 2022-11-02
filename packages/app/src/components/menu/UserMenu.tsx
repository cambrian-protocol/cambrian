import {
    Books,
    Question,
    SignOut,
    User,
    Wallet,
    WarningOctagon,
} from 'phosphor-react'
import {
    SUPPORT_DISCORD_LINK,
    WIKI_NOTION_LINK,
} from 'packages/app/config/ExternalLinks'

import BaseAvatar from '../avatars/BaseAvatar'
import { Menu } from 'grommet'
import React from 'react'
import UserMenuItemIcon from './UserMenuItemIcon'
import UserMenuItemLabel from './UserMenuItemLabel'
import { clearStagesLib } from '@cambrian/app/services/ceramic/CeramicUtils'
import { ellipseAddress } from '@cambrian/app/utils/helpers/ellipseAddress'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'
import { useRouter } from 'next/router'

interface UserMenuProps {
    injectedWalletAddress?: string
}

export default function UserMenu({ injectedWalletAddress }: UserMenuProps) {
    const router = useRouter()
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
                        currentUser.cambrianProfileDoc.content?.name || 'Anon'
                    }
                />
            ),
            icon: <UserMenuItemIcon icon={<User />} />,
            onClick: () => router.push('/dashboard?idx=5'),
        })
        menuItems.push({
            label: <UserMenuItemLabel label="Reset Account" />,
            icon: <UserMenuItemIcon icon={<WarningOctagon color="red" />} />,
            onClick: async () => {
                if (
                    window.confirm(
                        'Are you sure? All your compositions, templates and proposal will be deleted from your dashboard after confirming.'
                    )
                ) {
                    await clearStagesLib(currentUser)
                }
            },
        })
        menuItems.push({
            label: <UserMenuItemLabel label={'Logout'} />,
            onClick: disconnectWallet,
            icon: <UserMenuItemIcon icon={<SignOut />} />,
        })
    } else if (injectedWalletAddress === undefined) {
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
                    size: 'xsmall',
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
            ) : injectedWalletAddress ? (
                <BaseAvatar address={injectedWalletAddress} />
            ) : (
                <BaseAvatar icon={<Wallet />} />
            )}
        </Menu>
    )
}
