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

    const items =
        currentUser.address && currentUser.chainId
            ? [
                  {
                      label: (
                          <UserMenuItemLabel
                              subTitle={chainName}
                              label={ellipseAddress(currentUser.address, 9)}
                          />
                      ),
                      icon: <UserMenuItemIcon icon={<Wallet />} />,
                  },
                  {
                      label: <UserMenuItemLabel label="Learn" />,
                      icon: <UserMenuItemIcon icon={<Books />} />,
                  },
                  {
                      label: <UserMenuItemLabel label="Support" />,
                      icon: <UserMenuItemIcon icon={<Question />} />,
                  },
                  {
                      label: (
                          <UserMenuItemLabel
                              label={currentUser ? 'Logout' : 'Login'}
                          />
                      ),
                      onClick: disconnectWallet,
                      icon: (
                          <UserMenuItemIcon
                              icon={currentUser ? <SignOut /> : <SignIn />}
                          />
                      ),
                  },
              ]
            : [
                  {
                      label: (
                          <UserMenuItemLabel
                              label={currentUser?.address || 'Connect Wallet'}
                          />
                      ),
                      onClick: connectWallet,
                      icon: <UserMenuItemIcon icon={<Wallet />} />,
                  },
              ]

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
            items={items}
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
