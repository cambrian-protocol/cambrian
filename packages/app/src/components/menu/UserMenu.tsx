import {
    Books,
    Question,
    SignIn,
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
import { StageNames } from '@cambrian/app/models/StageModel'
import UserMenuItemIcon from './UserMenuItemIcon'
import UserMenuItemLabel from './UserMenuItemLabel'
import { clearStages } from '@cambrian/app/services/ceramic/CeramicUtils'
import { ellipseAddress } from '@cambrian/app/utils/helpers/ellipseAddress'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'
import { useRouter } from 'next/router'

export default function UserMenu() {
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
            onClick: () => router.push('/dashboard/profile'),
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
                    await clearStages(currentUser, StageNames.composition)
                    await clearStages(currentUser, StageNames.template)
                    await clearStages(currentUser, StageNames.proposal)
                }
            },
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
