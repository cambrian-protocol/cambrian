import React, { PropsWithChildren, useEffect, useState } from 'react'
import {
    UserAPI,
    UserRole,
    UserType,
} from '@cambrian/app/services/api/User.api'

import { ethers } from 'ethers'
import { requestMetaMaskProvider } from '@cambrian/app/wallets/metamask/metamask'

export type UserContextType = {
    currentUser: UserType | null
    currentSigner: ethers.providers.JsonRpcSigner | null
    setCurrentUserRole: (role: UserRole) => void
    logout: () => void
    login: () => void
}

export const UserContext = React.createContext<UserContextType>({
    currentUser: null,
    currentSigner: null,
    setCurrentUserRole: () => {},
    logout: () => {},
    login: () => {},
})

export const UserContextProvider = ({ children }: PropsWithChildren<{}>) => {
    // Used for FE and IPFS CRUD
    const [currentUser, setCurrentUser] = useState<UserType | null>(null)

    // Used to sign tx's - Generally open for discussions if separation is good practice.
    const [currentSigner, setCurrentSigner] =
        useState<ethers.providers.JsonRpcSigner | null>(null)

    useEffect(() => {
        // Connecting MetaMask eventEmitter
        if (typeof window.ethereum !== 'undefined') {
            window.ethereum.on('accountsChanged', (accounts: string[]) =>
                handleAccountChanged(accounts)
            )
            window.ethereum.on('chainChanged', handleChainChanged)
        }

        const storedCurrentUser = UserAPI.getSessionUser()

        // TODO Check if access token is expired
        if (storedCurrentUser) {
            setCurrentUser(storedCurrentUser)
        }

        return () => {
            if (typeof window.ethereum !== 'undefined') {
                window.ethereum.on('accountsChanged', () => {})
                window.ethereum.on('chainChanged', () => {})
            }
        }
    }, [])

    const handleAccountChanged = async (accounts: string[]) => {
        if (accounts.length === 0) {
            // Disconnected
            onLogout()
        } else {
            const user = await UserAPI.authenticateSession(accounts[0])
            setCurrentUser(user)
        }
    }

    const handleChainChanged = () => {
        // TODO Warn if on testnet
        console.log('Chain has changed')
    }

    const onLogin = async () => {
        const provider = await requestMetaMaskProvider()
        if (provider) {
            const signer = provider.getSigner()
            setCurrentSigner(signer)
            const address = await signer.getAddress()
            const user = await UserAPI.authenticateSession(address)
            setCurrentUser(user)
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
                setCurrentUserRole: updateRole,
                logout: onLogout,
                login: onLogin,
            }}
        >
            {children}
        </UserContext.Provider>
    )
}
