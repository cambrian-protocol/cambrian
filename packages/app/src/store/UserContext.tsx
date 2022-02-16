import React, { PropsWithChildren, useEffect, useState } from 'react'
import {
    UserAPI,
    UserRole,
    UserType,
} from '@cambrian/app/services/api/User.api'

import { ethers } from 'ethers'
import { requestMetaMaskProvider } from '@cambrian/app/wallets/metamask/metamask'

import Web3Modal from 'web3modal'
import { CeramicProvider, Networks } from 'use-ceramic'
import {
    AuthProvider,
    EthereumAuthProvider,
} from '@ceramicnetwork/blockchain-utils-linking'
import { requestWalletConnectProvider } from '../wallets/metamask/walletconnect'

export type UserContextType = {
    currentUser: UserType | null
    currentSigner: ethers.providers.JsonRpcSigner | null
    currentProvider: ethers.providers.Web3Provider | null
    setCurrentUserRole: (role: UserRole) => void
    logout: () => void
    login: () => void
}

export const UserContext = React.createContext<UserContextType>({
    currentUser: null,
    currentSigner: null,
    currentProvider: null,
    setCurrentUserRole: () => {},
    logout: () => {},
    login: () => {},
})

export const UserContextProvider = ({ children }: PropsWithChildren<{}>) => {
    // Used for FE and IPFS CRUD
    const [currentUser, setCurrentUser] = useState<UserType | null>(null)
    const [currentProvider, setCurrentProvider] =
        useState<ethers.providers.Web3Provider | null>(null)

    // Used to sign tx's - Generally open for discussions if separation is good practice.
    const [currentSigner, setCurrentSigner] =
        useState<ethers.providers.JsonRpcSigner | null>(null)

    useEffect(() => {
        if (currentProvider) {
            currentProvider.on('accountsChanged', (accounts: string[]) =>
                handleAccountChanged(accounts)
            )

            // Subscribe to chainId change
            currentProvider.on('chainChanged', (chainId: number) =>
                handleChainChanged()
            )

            // Subscribe to session disconnection
            currentProvider.on('disconnect', (code: number, reason: string) =>
                onLogout()
            )
        }

        const storedCurrentUser = UserAPI.getSessionUser()

        // TODO Check if access token is expired
        if (storedCurrentUser) {
            setCurrentUser(storedCurrentUser)
        }

        return () => {
            if (currentProvider) {
                currentProvider.on('accountsChanged', () => {})
                currentProvider.on('chainChanged', () => {})
                currentProvider.on('disconnect', () => {})
            }
        }
    }, [currentProvider])

    const handleAccountChanged = async (accounts: string[]) => {
        if (accounts.length === 0) {
            // Disconnected
            onLogout()
        } else {
            if (currentProvider) {
                const signer = currentProvider.getSigner()
                setCurrentSigner(signer)
            }
            const user = await UserAPI.authenticateSession(accounts[0])
            setCurrentUser(user)
        }
    }

    const handleChainChanged = () => {
        // TODO Warn if on testnet
        console.log('Chain has changed')
    }

    const onLogin = async () => {
        try {
            const provider = process.env.LOCAL_NETWORK
                ? new ethers.providers.Web3Provider({ isMetaMask: true })
                : await requestMetaMaskProvider()

            if (provider) {
                const signer = provider.getSigner()
                const address = await signer.getAddress()
                const user = await UserAPI.authenticateSession(address)
                setCurrentSigner(signer)
                setCurrentUser(user)
                setCurrentProvider(provider)
            }
        } catch (e) {
            // TODO ERROR MESSAGE
            console.error(e)
        }
    }

    const onLogout = () => {
        UserAPI.logoutSession()
        setCurrentUser(null)
        setCurrentSigner(null)
    }

    const updateRole = (updatedRole: UserRole) => {
        if (currentUser) {
            const updatedUser = { ...currentUser, role: updatedRole }
            setCurrentUser(updatedUser)
        } else {
            throw new Error('Update role on null User')
        }
    }

    return (
        <UserContext.Provider
            value={{
                currentUser: currentUser,
                currentSigner: currentSigner,
                currentProvider: currentProvider,
                setCurrentUserRole: updateRole,
                logout: onLogout,
                login: onLogin,
            }}
        >
            {children}
        </UserContext.Provider>
    )
}
