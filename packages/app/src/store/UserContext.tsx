import { FALLBACK_RPC_URL, INFURA_ID } from 'packages/app/config'
import React, {
    PropsWithChildren,
    useCallback,
    useEffect,
    useReducer,
    useState,
} from 'react'

import PermissionProvider from './PermissionContext'
import WalletConnectProvider from '@walletconnect/web3-provider'
import Web3Modal from 'web3modal'
import _ from 'lodash'
import { ethers } from 'ethers'

export type PermissionType = string

export type UserContextType = {
    currentUser: UserType
    disconnectWallet: () => void
    connectWallet: () => Promise<void>
    addPermission: (permission: PermissionType) => void
}

export type UserType = {
    provider?: any
    web3Provider:
        | ethers.providers.Web3Provider
        | ethers.providers.JsonRpcProvider
    signer?: ethers.Signer
    address?: string
    chainId?: number
    permissions: PermissionType[]
}

type UserActionType =
    | {
          type: 'SET_WEB3_PROVIDER'
          provider?: UserType['provider']
          web3Provider: UserType['web3Provider']
          signer?: UserType['signer']
          address?: UserType['address']
          chainId?: UserType['chainId']
      }
    | {
          type: 'SET_SIGNER'
          address?: UserType['address']
          signer: UserType['signer']
      }
    | {
          type: 'SET_CHAIN_ID'
          chainId?: UserType['chainId']
      }
    | {
          type: 'RESET_WEB3_PROVIDER'
      }
    | {
          type: 'ADD_PERMISSION'
          permission: PermissionType
      }

const initialUser: UserType = {
    provider: undefined,
    web3Provider: new ethers.providers.JsonRpcProvider(FALLBACK_RPC_URL),
    signer: undefined,
    address: undefined,
    chainId: undefined,
    permissions: [],
}

const providerOptions = {
    injected: {
        package: null,
    },
    walletconnect: {
        package: WalletConnectProvider,
        options: {
            infuraId: INFURA_ID,
        },
    },
}

let web3Modal: any
if (typeof window !== 'undefined') {
    web3Modal = new Web3Modal({
        network: 'mainnet',
        cacheProvider: true,
        providerOptions,
        theme: 'dark',
    })
}

function userReducer(state: UserType, action: UserActionType): UserType {
    switch (action.type) {
        case 'SET_WEB3_PROVIDER':
            return {
                ...state,
                provider: action.provider,
                web3Provider: action.web3Provider,
                signer: action.signer,
                address: action.address,
                chainId: action.chainId,
                permissions: [],
            }
        case 'SET_SIGNER':
            return {
                ...state,
                address: action.address,
                signer: action.signer,
                permissions: [],
            }
        case 'SET_CHAIN_ID':
            return {
                ...state,
                chainId: action.chainId,
            }
        case 'RESET_WEB3_PROVIDER':
            return initialUser
        case 'ADD_PERMISSION':
            return {
                ...state,
                permissions: [...state.permissions, action.permission],
            }
        default:
            throw new Error()
    }
}

export const UserContext = React.createContext<UserContextType>({
    currentUser: initialUser,
    addPermission: () => {},
    disconnectWallet: () => {},
    connectWallet: async () => {},
})

export const UserContextProvider = ({ children }: PropsWithChildren<{}>) => {
    const [user, dispatch] = useReducer(userReducer, initialUser)
    const { provider, web3Provider } = user

    const connectWallet = useCallback(async function () {
        try {
            const provider = await web3Modal.connect()
            const web3Provider = new ethers.providers.Web3Provider(provider)
            const signer = web3Provider.getSigner()
            const address = await signer.getAddress()
            const network = await web3Provider.getNetwork()

            dispatch({
                type: 'SET_WEB3_PROVIDER',
                provider,
                web3Provider,
                signer,
                address,
                chainId: network.chainId,
            })
        } catch (e) {
            console.warn(e)
        }
    }, [])

    const disconnectWallet = useCallback(
        async function () {
            await web3Modal.clearCachedProvider()
            if (
                provider?.disconnect &&
                typeof provider.disconnect === 'function'
            ) {
                await provider.disconnect()
            }
            dispatch({
                type: 'RESET_WEB3_PROVIDER',
            })
        },
        [provider]
    )

    // Auto connect to the cached provider
    useEffect(() => {
        if (web3Modal.cachedProvider) {
            connectWallet()
        }
    }, [connectWallet])

    // EIP-1193 Event Listener
    useEffect(() => {
        if (provider?.on) {
            const handleAccountsChanged = async (accounts: string[]) => {
                try {
                    // Get the checksummed address to avoid Blockies seed differences
                    const updatedSigner = web3Provider.getSigner()
                    const updatedAddress = await updatedSigner.getAddress()
                    dispatch({
                        type: 'SET_SIGNER',
                        address: updatedAddress,
                        signer: updatedSigner,
                    })
                } catch (e) {
                    disconnectWallet()
                    console.warn(e)
                }
            }

            const handleChainChanged = (_hexChainId: string) => {
                window.location.reload()
            }

            const handleDisconnect = (error: {
                code: number
                message: string
            }) => {
                console.warn('disconnect', error)
                disconnectWallet()
            }

            provider.on('accountsChanged', handleAccountsChanged)
            provider.on('chainChanged', handleChainChanged)
            provider.on('disconnect', handleDisconnect)

            //  Listener Cleanup
            return () => {
                if (provider.removeListener) {
                    provider.removeListener(
                        'accountsChanged',
                        handleAccountsChanged
                    )
                    provider.removeListener('chainChanged', handleChainChanged)
                    provider.removeListener('disconnect', handleDisconnect)
                }
            }
        }
    }, [provider, disconnectWallet])

    const addPermission = (newPermission: PermissionType) => {
        if (user.signer && !user.permissions.includes(newPermission)) {
            dispatch({ type: 'ADD_PERMISSION', permission: newPermission })
        }
    }

    return (
        <UserContext.Provider
            value={{
                currentUser: user,
                addPermission: addPermission,
                connectWallet: connectWallet,
                disconnectWallet: disconnectWallet,
            }}
        >
            <PermissionProvider permissions={user.permissions}>
                {children}
            </PermissionProvider>
        </UserContext.Provider>
    )
}
