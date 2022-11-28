import { useCallback, useEffect, useState } from 'react'

import { Box } from 'grommet'
import ConnectWalletPage from '@cambrian/app/components/sections/ConnectWalletPage'
import DashboardHeader from '@cambrian/app/components/layout/header/DashboardHeader'
import { INFURA_ID } from '../config'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import RedeemableTokenListWidget from '@cambrian/app/ui/dashboard/widgets/RedeemableTokenListWidget'
import { SafeAppWeb3Modal } from '@gnosis.pm/safe-apps-web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { ethers } from 'ethers'

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
    web3Modal = new SafeAppWeb3Modal({
        network: 'mainnet',
        cacheProvider: true,
        providerOptions,
        theme: 'dark',
    })
}

type ConnectedWallet = {
    provider: any
    web3Provider: ethers.providers.Web3Provider
    signer: ethers.providers.JsonRpcSigner
    address: string
    network: ethers.providers.Network
}

export default function Safe() {
    const [connectedWallet, setConnectedWallet] = useState<ConnectedWallet>()
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        connectWallet()
    }, [])

    const connectWallet = useCallback(async function () {
        try {
            const provider = await web3Modal.requestProvider()
            const web3Provider = new ethers.providers.Web3Provider(provider)
            const signer = web3Provider.getSigner()
            const address = await signer.getAddress()
            const network = await web3Provider.getNetwork()

            setConnectedWallet({
                provider: provider,
                web3Provider: web3Provider,
                signer: signer,
                address: address,
                network: network,
            })
        } catch (e) {
            console.log(e)
            cpLogger.push(e)
        }
        setIsLoaded(true)
    }, [])

    const disconnectWallet = useCallback(
        async function () {
            await web3Modal.clearCachedProvider()
            if (
                connectedWallet &&
                connectedWallet.provider?.disconnect &&
                typeof connectedWallet.provider.disconnect === 'function'
            ) {
                await connectedWallet.provider.disconnect()
            }
            setConnectedWallet(undefined)
        },
        [connectedWallet]
    )

    // EIP-1193 Event Listener
    useEffect(() => {
        if (connectedWallet && connectedWallet.provider?.on) {
            const handleAccountsChanged = async (accounts: string[]) => {
                try {
                    window.location.reload()
                } catch (e) {
                    disconnectWallet()
                }
            }

            const handleChainChanged = (_hexChainId: string) => {
                window.location.reload()
            }

            const handleDisconnect = (error: {
                code: number
                message: string
            }) => {
                disconnectWallet()
            }

            connectedWallet.provider.on(
                'accountsChanged',
                handleAccountsChanged
            )
            connectedWallet.provider.on('chainChanged', handleChainChanged)
            connectedWallet.provider.on('disconnect', handleDisconnect)

            //  Listener Cleanup
            return () => {
                if (connectedWallet.provider.removeListener) {
                    connectedWallet.provider.removeListener(
                        'accountsChanged',
                        handleAccountsChanged
                    )
                    connectedWallet.provider.removeListener(
                        'chainChanged',
                        handleChainChanged
                    )
                    connectedWallet.provider.removeListener(
                        'disconnect',
                        handleDisconnect
                    )
                }
            }
        }
    }, [connectedWallet, disconnectWallet])

    return (
        <>
            {isLoaded ? (
                connectedWallet ? (
                    <PageLayout
                        kind="narrow"
                        injectedWalletAddress={connectedWallet?.address}
                    >
                        <Box pad="large" gap="medium">
                            <DashboardHeader
                                title="Redeemable funds"
                                description="Redeem Solver funds sent to a Gnosis Safe"
                            />
                            <RedeemableTokenListWidget
                                provider={connectedWallet.web3Provider}
                                address={connectedWallet.address}
                                chainId={connectedWallet.network.chainId}
                            />
                        </Box>
                    </PageLayout>
                ) : (
                    <ConnectWalletPage connectWallet={connectWallet} />
                )
            ) : (
                <LoadingScreen context="Connecting Wallet" />
            )}
        </>
    )
}

export async function getStaticProps() {
    return {
        props: { noWalletPrompt: true },
    }
}
