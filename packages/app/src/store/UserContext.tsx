import {
    BasicProfile,
    EthereumAuthProvider,
    SelfID,
    useViewerConnection,
} from '@self.id/framework'
import React, {
    PropsWithChildren,
    useCallback,
    useEffect,
    useReducer,
    useState,
} from 'react'

import { INFURA_ID } from 'packages/app/config'
import PermissionProvider from './PermissionContext'
import WalletConnectProvider from '@walletconnect/web3-provider'
import Web3Modal from 'web3modal'
import _ from 'lodash'
import { cpLogger } from '../services/api/Logger.api'
import { ethers } from 'ethers'

export type PermissionType = string

export type UserContextType = {
    currentUser: UserType | null
    disconnectWallet: () => void
    connectWallet: () => Promise<void>
    addPermission: (permission: PermissionType) => void
    isUserLoaded: boolean
    initSelfID: (selfID: SelfID) => Promise<void>
}

export type UserType = {
    provider: any
    web3Provider: ethers.providers.Web3Provider
    signer: ethers.Signer
    address: string
    chainId: number
    permissions: PermissionType[]
    selfID: SelfID
    basicProfile?: BasicProfile
}

type UserActionType =
    | {
          type: 'SET_USER'
          provider: UserType['provider']
          web3Provider: UserType['web3Provider']
          signer: UserType['signer']
          address: UserType['address']
          chainId: UserType['chainId']
          selfID: UserType['selfID']
          basicProfile?: BasicProfile
      }
    | {
          type: 'SET_SIGNER'
          address: UserType['address']
          signer: UserType['signer']
      }
    | {
          type: 'SET_CHAIN_ID'
          chainId: UserType['chainId']
      }
    | {
          type: 'RESET_WEB3_PROVIDER'
      }
    | {
          type: 'ADD_PERMISSION'
          permission: PermissionType
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

function userReducer(
    state: UserType | null,
    action: UserActionType
): UserType | null {
    switch (action.type) {
        case 'SET_USER':
            return {
                ...state,
                provider: action.provider,
                web3Provider: action.web3Provider,
                signer: action.signer,
                address: action.address,
                chainId: action.chainId,
                selfID: action.selfID,
                basicProfile: action.basicProfile,
                permissions: [],
            }
        case 'SET_SIGNER':
            if (state) {
                return {
                    ...state,
                    address: action.address,
                    signer: action.signer,
                    permissions: [],
                }
            }
            break
        case 'SET_CHAIN_ID':
            if (state) {
                return {
                    ...state,
                    chainId: action.chainId,
                }
            }
            break
        case 'ADD_PERMISSION':
            if (state) {
                return {
                    ...state,
                    permissions: [...state.permissions, action.permission],
                }
            }
            break
        case 'RESET_WEB3_PROVIDER':
            return null
        default:
            throw new Error()
    }

    return null
}

export const UserContext = React.createContext<UserContextType>({
    currentUser: null,
    addPermission: () => {},
    disconnectWallet: () => {},
    connectWallet: async () => {},
    isUserLoaded: false,
    initSelfID: async () => {},
})

export const UserContextProvider = ({ children }: PropsWithChildren<{}>) => {
    const [ceramicConnection, ceramicConnect, ceramicDisconnect] =
        useViewerConnection()
    const [user, dispatch] = useReducer(userReducer, null)
    const [walletConnection, setWalletConnection] = useState<Omit<
        UserType,
        'selfID' | 'basicProfile'
    > | null>(null)
    const [isUserLoaded, setIsUserLoaded] = useState(false)

    const connectWallet = useCallback(async function () {
        try {
            const provider = await web3Modal.connect()
            const web3Provider = new ethers.providers.Web3Provider(provider)
            const signer = web3Provider.getSigner()
            const address = await signer.getAddress()
            const network = await web3Provider.getNetwork()
            setWalletConnection({
                address: address,
                signer: signer,
                web3Provider: web3Provider,
                provider: provider,
                chainId: network.chainId,
                permissions: [],
            })
            await ceramicConnect(new EthereumAuthProvider(provider, address))
        } catch (e) {
            setIsUserLoaded(true)
            cpLogger.push(e)
        }
    }, [])

    useEffect(() => {
        console.log(ceramicConnection)
        if (
            ceramicConnection.status === 'connected' &&
            ceramicConnection.selfID &&
            walletConnection
        ) {
            initSelfID(ceramicConnection.selfID)
        }
    }, [ceramicConnection])

    const initSelfID = async (ceramicSelfID: SelfID) => {
        if (walletConnection) {
            const basicProfile = await ceramicSelfID.get('basicProfile')
            dispatch({
                type: 'SET_USER',
                provider: walletConnection.provider,
                web3Provider: walletConnection.web3Provider,
                signer: walletConnection.signer,
                address: walletConnection.address,
                chainId: walletConnection.chainId,
                basicProfile: basicProfile || undefined,
                selfID: ceramicSelfID,
            })
            setIsUserLoaded(true)
        }
    }

    const disconnectWallet = useCallback(
        async function () {
            await web3Modal.clearCachedProvider()
            if (
                user &&
                user.provider?.disconnect &&
                typeof user.provider.disconnect === 'function'
            ) {
                ceramicDisconnect()
                await user.provider.disconnect()
            }
            dispatch({
                type: 'RESET_WEB3_PROVIDER',
            })
        },
        [user]
    )

    // Auto connect to the cached provider
    useEffect(() => {
        if (web3Modal.cachedProvider) {
            connectWallet()
        }
    }, [connectWallet])

    // EIP-1193 Event Listener
    useEffect(() => {
        if (user && user.provider?.on) {
            const handleAccountsChanged = async (accounts: string[]) => {
                try {
                    // TODO Account switch doesn't reconnect to Ceramic properly
                    window.location.reload()
                    /*  
                    // Get the checksummed address to avoid Blockies seed differences
                    const updatedSigner = user.web3Provider.getSigner()
                    const updatedAddress = await updatedSigner.getAddress()

                    await ceramicConnect(
                        new EthereumAuthProvider(user.provider, updatedAddress)
                    )

                    dispatch({
                        type: 'SET_SIGNER',
                        address: updatedAddress,
                        signer: updatedSigner,
                    }) */
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

            user.provider.on('accountsChanged', handleAccountsChanged)
            user.provider.on('chainChanged', handleChainChanged)
            user.provider.on('disconnect', handleDisconnect)

            //  Listener Cleanup
            return () => {
                if (user.provider.removeListener) {
                    user.provider.removeListener(
                        'accountsChanged',
                        handleAccountsChanged
                    )
                    user.provider.removeListener(
                        'chainChanged',
                        handleChainChanged
                    )
                    user.provider.removeListener('disconnect', handleDisconnect)
                }
            }
        }
    }, [user, disconnectWallet])

    const addPermission = (newPermission: PermissionType) => {
        if (user && user.signer && !user.permissions.includes(newPermission)) {
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
                isUserLoaded: isUserLoaded,
                initSelfID: initSelfID,
            }}
        >
            <PermissionProvider permissions={user ? user.permissions : []}>
                {children}
            </PermissionProvider>
        </UserContext.Provider>
    )
}
