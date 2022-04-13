import React, { PropsWithChildren, useEffect, useState } from 'react'

import PermissionProvider from './PermissionContext'
import _ from 'lodash'
import { ethers } from 'ethers'
import { requestMetaMaskProvider } from '@cambrian/app/wallets/metamask/metamask'

export type Permission = string

export type UserType = {
    address: string
    signer: ethers.providers.JsonRpcSigner
    permissions: Permission[]
}

export type UserContextType = {
    currentUser: UserType | null
    currentProvider: ethers.providers.Web3Provider | null
    addPermission: (permission: Permission) => void
    logout: () => void
    login: () => Promise<boolean>
}

export const UserContext = React.createContext<UserContextType>({
    currentUser: null,
    currentProvider: null,
    addPermission: () => {},
    logout: () => {},
    login: async () => false,
})

export const UserContextProvider = ({ children }: PropsWithChildren<{}>) => {
    const [currentUser, setCurrentUser] = useState<UserType | null>(null)
    const [currentProvider, setCurrentProvider] =
        useState<ethers.providers.Web3Provider | null>(null)

    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.on('connect', () => {
                handleEthereumConnect()
            })

            window.ethereum.on('accountsChanged', (accounts: string[]) =>
                handleAccountChanged(accounts)
            )

            // Subscribe to chainId change
            window.ethereum.on('chainChanged', (chainId: number) =>
                handleChainChanged()
            )

            // Subscribe to session disconnection
            window.ethereum.on('disconnect', (code: number, reason: string) =>
                onLogout()
            )
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.on('accountsChanged', handleAccountChanged)
                window.ethereum.on('chainChanged', handleChainChanged)
                window.ethereum.on('connect', handleEthereumConnect)
                window.ethereum.on('disconnect', onLogout)
            }
        }
    }, [])

    const handleEthereumConnect = async () => {
        console.log('Handle connect')
        const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts',
        })
        handleAccountChanged(accounts)
    }

    const handleAccountChanged = async (accounts?: string[]) => {
        if (accounts && accounts.length === 0) {
            // Disconnected
            onLogout()
        } else {
            const provider = await requestMetaMaskProvider()

            if (provider) {
                const signer = provider.getSigner()
                const address = await signer.getAddress()
                setCurrentUser({
                    address: address,
                    signer: signer,
                    permissions: [],
                })
                setCurrentProvider(provider)
            }
        }
    }

    const handleChainChanged = () => {
        // TODO Warn if on testnet
        console.log('Chain has changed')
    }

    const onLogin = async () => {
        try {
            const provider = await requestMetaMaskProvider()

            if (provider) {
                const signer = provider.getSigner()
                console.log('provider: ', signer.provider)

                const address = await signer.getAddress()
                setCurrentUser({
                    address: address,
                    signer: signer,
                    permissions: [],
                })
                setCurrentProvider(provider)
                return true
            }
        } catch (e) {
            // TODO ERROR MESSAGE
            console.error(e)
        }
        return false
    }

    const onLogout = () => {
        setCurrentUser(null)
    }

    const addPermission = (newPermission: Permission) => {
        if (currentUser && !currentUser.permissions.includes(newPermission)) {
            const updatedPermissions = [...currentUser.permissions]
            updatedPermissions.push(newPermission)
            if (!_.isEqual(currentUser.permissions, updatedPermissions)) {
                setCurrentUser({
                    ...currentUser,
                    permissions: updatedPermissions,
                })
            }
        }
    }

    return (
        <UserContext.Provider
            value={{
                currentUser: currentUser,
                currentProvider: currentProvider,
                addPermission: addPermission,
                logout: onLogout,
                login: onLogin,
            }}
        >
            <PermissionProvider permissions={currentUser?.permissions}>
                {children}
            </PermissionProvider>
        </UserContext.Provider>
    )
}
