import {
    At,
    IconContext,
    Link,
    SignIn,
    SignOut,
    UserCircle,
    Wallet,
} from 'phosphor-react'
import { Box, Menu, Text } from 'grommet'

import BaseAvatar from '../avatars/BaseAvatar'
import React from 'react'
import { ellipseAddress } from '@cambrian/app/utils/helpers/ellipseAddress'
import { supportedChains } from '@cambrian/app/constants/Chains'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'

interface UserMenuProps {}

export default function UserMenu({}: UserMenuProps) {
    const { currentUser, disconnectWallet, connectWallet } = useCurrentUser()

    let chainName = 'Chain not supported'

    if (currentUser.chainId && supportedChains[currentUser.chainId]) {
        chainName = supportedChains[currentUser.chainId].chainData.name
    }

    const items =
        currentUser.address && currentUser.chainId
            ? [
                  {
                      label: (
                          <UserMenuItemLabel
                              truncateAddress
                              label={currentUser.address}
                          />
                      ),
                      icon: <UserMenuItemIcon icon={<At />} />,
                  },
                  {
                      label: <UserMenuItemLabel label={chainName} />,
                      icon: <UserMenuItemIcon icon={<Link />} />,
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
            dropAlign={{ left: 'right', top: 'bottom' }}
            dropProps={{
                round: {
                    corner: 'right',
                    size: 'small',
                },
            }}
            dropBackground="background-popup"
            items={items}
        >
            <BaseAvatar address={currentUser.address} />
        </Menu>
    )
}

interface UserMenuItemLabelProps {
    label: string
    truncateAddress?: boolean
}

const UserMenuItemLabel = ({
    label,
    truncateAddress,
}: UserMenuItemLabelProps) => {
    return (
        <Box alignSelf="center" pad={{ horizontal: 'medium' }} width="small">
            <Text truncate={!truncateAddress}>
                {truncateAddress ? ellipseAddress(label) : label}
            </Text>
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
