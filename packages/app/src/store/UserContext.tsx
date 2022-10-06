import { CERAMIC_NODE_ENDPOINT, INFURA_ID } from 'packages/app/config'
import { EthereumWebAuth, getAccountId } from '@didtools/pkh-ethereum'
import React, {
    PropsWithChildren,
    useCallback,
    useEffect,
    useReducer,
    useState,
} from 'react'

import { CeramicClient } from '@ceramicnetwork/http-client'
import ConnectWalletPage from '../components/sections/ConnectWalletPage'
import { DIDSession } from 'did-session'
import PermissionProvider from './PermissionContext'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import WalletConnectProvider from '@walletconnect/web3-provider'
import Web3Modal from 'web3modal'
import _ from 'lodash'
import { cpLogger } from '../services/api/Logger.api'
import { ethers } from 'ethers'
import { useRouter } from 'next/router'

export type PermissionType = string

export type CambrianProfileType = {
    name: string
    title: string
    description: string
    email: string
    avatar: string
    company: string
    website: string
    twitter: string
    discordWebhook: string
}

export const initialCambrianProfile = {
    name: '',
    title: '',
    description: '',
    email: '',
    avatar: '',
    company: '',
    website: '',
    twitter: '',
    discordWebhook: '',
}

export type UserContextType = {
    currentUser: UserType | null
    disconnectWallet: () => void
    connectWallet: () => Promise<void>
    addPermission: (permission: PermissionType) => void
    isUserLoaded: boolean
}

export type UserType = {
    provider: any
    web3Provider: ethers.providers.Web3Provider
    signer: ethers.Signer
    address: string
    chainId: number
    permissions: PermissionType[]
    cambrianProfileDoc: TileDocument<CambrianProfileType>
    session: DIDSession
    did: string // did:pkh
}

type UserActionType =
    | {
          type: 'SET_USER'
          provider: UserType['provider']
          web3Provider: UserType['web3Provider']
          signer: UserType['signer']
          address: UserType['address']
          chainId: UserType['chainId']
          cambrianProfileDoc: TileDocument<CambrianProfileType>
          session: UserType['session']
          did: UserType['did']
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
                cambrianProfileDoc: action.cambrianProfileDoc,
                permissions: [],
                session: action.session,
                did: action.did,
            }
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
})

type UserContextProviderProps = PropsWithChildren<{}> & {
    noWalletPrompt?: boolean
}

export const UserContextProvider = ({
    children,
    noWalletPrompt,
}: UserContextProviderProps) => {
    const [user, dispatch] = useReducer(userReducer, null)
    const [isUserLoaded, setIsUserLoaded] = useState(false)
    const router = useRouter()

    const connectWallet = useCallback(async function () {
        try {
            const provider = await web3Modal.connect()
            const web3Provider = new ethers.providers.Web3Provider(provider)
            const signer = web3Provider.getSigner()
            const address = await signer.getAddress()
            const network = await web3Provider.getNetwork()

            const session = await loadSession(provider, network, address)

            const ceramic = new CeramicClient(CERAMIC_NODE_ENDPOINT)
            ceramic.did = session.did
            const cambrianProfileDoc = (await TileDocument.deterministic(
                ceramic,
                {
                    controllers: [ceramic.did.parent],
                    family: 'cambrian-profile',
                },
                { pin: true }
            )) as TileDocument<CambrianProfileType>

            dispatch({
                type: 'SET_USER',
                provider: provider,
                web3Provider: web3Provider,
                signer: signer,
                address: address,
                chainId: network.chainId,
                cambrianProfileDoc: cambrianProfileDoc,
                session: session,
                did: ceramic.did.parent,
            })
            setIsUserLoaded(true)
        } catch (e) {
            cpLogger.push(e)
            setIsUserLoaded(true)
        }
    }, [])

    const disconnectWallet = useCallback(
        async function () {
            await web3Modal.clearCachedProvider()
            if (
                user &&
                user.provider?.disconnect &&
                typeof user.provider.disconnect === 'function'
            ) {
                await user.provider.disconnect()
            }
            dispatch({
                type: 'RESET_WEB3_PROVIDER',
            })
        },
        [user]
    )

    useEffect(() => {
        if (noWalletPrompt !== true || web3Modal.cachedProvider) connectWallet()
    }, [])

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

    const loadSession = async (
        provider: any,
        network: ethers.providers.Network,
        accountAddress: string
    ) => {
        console.log(provider)
        let sessionStr = localStorage.getItem(
            `cambrian-session/${network.chainId}/${accountAddress}`
        )
        let session
        if (sessionStr) {
            session = await DIDSession.fromSession(sessionStr)
        }

        if (!session || (session.hasSession && session.expireInSecs < 3600)) {
            setIsUserLoaded(true)
            const accountId = await getAccountId(provider, accountAddress)
            const authMethod = await EthereumWebAuth.getAuthMethod(
                provider,
                accountId
            )
            session = await DIDSession.authorize(authMethod, {
                statement:
                    'This signature allows Cambrian Protocol to update your account data. The permission expires in 24 hours.',
                resources: ['ceramic://*'],
            })
            localStorage.setItem(
                `cambrian-session/${network.chainId}/${accountAddress}`,
                session.serialize()
            )
        }
        return session
    }

    const addPermission = (newPermission: PermissionType) => {
        if (user && !user.permissions.includes(newPermission)) {
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
            }}
        >
            <PermissionProvider permissions={user ? user.permissions : []}>
                {!user && router.pathname !== '/' && isUserLoaded ? (
                    <ConnectWalletPage connectWallet={connectWallet} />
                ) : (
                    children
                )}
            </PermissionProvider>
        </UserContext.Provider>
    )
}
