import { useCallback, useEffect, useState } from 'react'

import { Box } from 'grommet'
import DashboardHeader from '@cambrian/app/components/layout/header/DashboardHeader'
import { INFURA_ID } from '../config'
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
    web3Provider: ethers.providers.Web3Provider
    signer: ethers.providers.JsonRpcSigner
    address: string
    network: ethers.providers.Network
}

export default function Safe() {
    const [connectedWallet, setConnectedWallet] = useState<ConnectedWallet>()

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
                web3Provider: web3Provider,
                signer: signer,
                address: address,
                network: network,
            })
        } catch (e) {
            console.log(e)
            cpLogger.push(e)
        }
    }, [])

    return (
        <PageLayout kind="narrow" noWalletPrompt>
            <Box pad="large" gap="medium">
                <DashboardHeader
                    title="Redeem your token"
                    description="Vivamus magna justo, lacinia eget consectetur sed, convallis at tellus. Donec rutrum congue leo eget malesuada. Vivamus suscipit tortor eget felis porttitor volutpat."
                />
                {connectedWallet && (
                    <RedeemableTokenListWidget
                        signerOrProvider={connectedWallet.signer}
                        address={connectedWallet.address}
                        chainId={connectedWallet.network.chainId}
                    />
                )}
            </Box>
        </PageLayout>
    )
}
