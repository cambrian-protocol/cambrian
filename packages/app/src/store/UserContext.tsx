import React, { PropsWithChildren, useEffect, useState } from 'react'

import { ethers } from 'ethers'
import { requestMetaMaskProvider } from '@cambrian/app/wallets/metamask/metamask'

export type UserType = {
    address: string
    signer: ethers.providers.JsonRpcSigner
}

export type UserContextType = {
    currentUser: UserType | null
    currentProvider: ethers.providers.Web3Provider | null
    logout: () => void
    login: () => Promise<boolean>
}

export const UserContext = React.createContext<UserContextType>({
    currentUser: null,
    currentProvider: null,
    logout: () => {},
    login: async () => false,
})

export const UserContextProvider = ({ children }: PropsWithChildren<{}>) => {
    const [currentUser, setCurrentUser] = useState<UserType | null>(null)
    const [currentProvider, setCurrentProvider] =
        useState<ethers.providers.Web3Provider | null>(null)

    useEffect(() => {
        if (window.ethereum) {
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
                window.ethereum.on('accountsChanged', () => {})
                window.ethereum.on('chainChanged', () => {})
                window.ethereum.on('connect', () => {})
                window.ethereum.on('disconnect', () => {})
            }
        }
    }, [])

    const handleAccountChanged = async (accounts: string[]) => {
        if (accounts.length === 0) {
            // Disconnected
            onLogout()
        } else {
            const provider = process.env.LOCAL_NETWORK
                ? new ethers.providers.Web3Provider({ isMetaMask: true })
                : await requestMetaMaskProvider()

            if (provider) {
                const signer = provider.getSigner()
                const address = await signer.getAddress()
                setCurrentUser({ address: address, signer: signer })
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
            const provider = process.env.LOCAL_NETWORK
                ? new ethers.providers.Web3Provider({ isMetaMask: true })
                : await requestMetaMaskProvider()

            if (provider) {
                const signer = provider.getSigner()
                const address = await signer.getAddress()
                setCurrentUser({ address: address, signer: signer })
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

    return (
        <UserContext.Provider
            value={{
                currentUser: currentUser,
                currentProvider: currentProvider,
                logout: onLogout,
                login: onLogin,
            }}
        >
            {children}
        </UserContext.Provider>
    )
}
