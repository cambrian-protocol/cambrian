import { Anchor, Box, Heading, Paragraph } from 'grommet'

import PageLayout from '@cambrian/app/components/layout/PageLayout'
import { ethers } from 'ethers'
import { useCallback, useEffect, useState } from 'react'
import { SafeAppWeb3Modal } from '@gnosis.pm/safe-apps-web3modal'
import { INFURA_ID } from '../../config'
import WalletConnectProvider from '@walletconnect/web3-provider'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import CTFContract from '@cambrian/app/contracts/CTFContract'

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
    const [ctf, setCtf] = useState<CTFContract>()

    useEffect(() => {
        connectWallet()
    }, [])

    useEffect(() => {
        if (connectedWallet) {
            getCTF()
        }
    }, [connectedWallet])

    useEffect(() => {
        if (connectedWallet && ctf) {
            getRedeemable()
        }
    }, [connectedWallet, ctf])

    const getCTF = async () => {
        if (connectedWallet) {
            const contract = new CTFContract(
                connectedWallet.signer,
                connectedWallet.network.chainId
            )

            if (contract) {
                setCtf(contract)
            }
        }
    }

    const getRedeemable = async () => {
        if (!ctf || !connectedWallet) {
            return
        }

        // Find all the conditional tokens that have been sent to our connected user's address
        const transferBatchFilter = ctf.contract.filters.TransferBatch(
            null, // operator
            null, // from
            connectedWallet.address // to
        )

        const transferBatchLogs = await ctf.contract.queryFilter(
            transferBatchFilter
        )

        const positionIds = transferBatchLogs.map((log) => log.args![3]).flat()
        const values = transferBatchLogs.map((log) => log.args![4]).flat()

        // These are the conditional token IDs and how much was transferred to our user
        const positions = positionIds.map((pos, i) => {
            return {
                positionId: pos,
                value: values[i],
            }
        })

        // For getting resolved conditions
        const conditionResolutionFilter =
            ctf.contract.filters.ConditionResolution(null, null, null)

        const resolvedConditionLogs = await ctf.contract.queryFilter(
            conditionResolutionFilter
        )

        // For getting payouts the user has already redeemed
        const payoutRedemptionFilter = ctf.contract.filters.PayoutRedemption(
            connectedWallet.address, // redeemer
            null, // collateralToken
            null // parentCollectionID
        )

        const payoutRedemptionLogs = await ctf.contract.queryFilter(
            payoutRedemptionFilter
        )
    }

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

    return <></>
}
