import { Box, Text } from 'grommet'
import {
    RedeemablePosition,
    RedeemablePositionsHash,
    getRedeemablePositions,
} from '@cambrian/app/utils/helpers/redeemHelper'
import { useCallback, useEffect, useState } from 'react'

import CTFContract from '@cambrian/app/contracts/CTFContract'
import DashboardHeader from '@cambrian/app/components/layout/header/DashboardHeader'
import { INFURA_ID } from '../../config'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
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
    const [redeemablePositions, setRedeemablePositions] =
        useState<RedeemablePositionsHash>({})

    useEffect(() => {
        connectWallet()
    }, [])

    useEffect(() => {
        if (connectedWallet) init(connectedWallet)
    }, [connectedWallet])

    const init = async (connectedWallet: ConnectedWallet) => {
        setRedeemablePositions(
            await getRedeemablePositions(
                connectedWallet.address,
                connectedWallet.web3Provider,
                connectedWallet.network.chainId
            )
        )
    }

    const onRedeem = async (redeemablePosition: RedeemablePosition) => {
        if (connectedWallet) {
            try {
                const ctfContract = new CTFContract(
                    connectedWallet.web3Provider,
                    connectedWallet.network.chainId
                )
                await ctfContract.contract.redeemPositions(
                    redeemablePosition.collateralToken.address,
                    redeemablePosition.parentCollectionId,
                    redeemablePosition.conditionId,
                    redeemablePosition.partition
                )
            } catch (e) {
                console.error(e)
            }
        }
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

    return (
        <PageLayout kind="narrow">
            <Box pad="large" gap="medium">
                <DashboardHeader
                    title="Redeem your token"
                    description="Vivamus magna justo, lacinia eget consectetur sed, convallis at tellus. Donec rutrum congue leo eget malesuada. Vivamus suscipit tortor eget felis porttitor volutpat."
                />
                {Object.keys(redeemablePositions).map((positionId, idx) => {
                    const redeemablePosition = redeemablePositions[positionId]
                    const formattedAmount = ethers.utils.formatUnits(
                        redeemablePositions[positionId].amount,
                        redeemablePosition.collateralToken.decimals
                    )
                    return (
                        <Box
                            key={positionId}
                            pad="small"
                            border
                            round="xsmall"
                            direction="row"
                        >
                            <Box
                                flex
                                direction="row"
                                justify="between"
                                pad={{
                                    left: 'small',
                                    right: 'medium',
                                    vertical: 'small',
                                }}
                                align="center"
                            >
                                <Box>
                                    <Text>
                                        {redeemablePosition.solverMetadata
                                            ?.solverTag.title || 'Solver'}
                                    </Text>
                                    <Text color={'dark-4'} size="small">
                                        {
                                            redeemablePositions[positionId]
                                                .solverAddress
                                        }
                                    </Text>
                                </Box>
                                <Text>
                                    {formattedAmount}{' '}
                                    {redeemablePosition.collateralToken.symbol}
                                </Text>
                            </Box>
                            <Box justify="center">
                                <LoaderButton
                                    primary
                                    onClick={() => onRedeem(redeemablePosition)}
                                    isLoading={false}
                                    label="Redeem"
                                />
                            </Box>
                        </Box>
                    )
                })}
            </Box>
        </PageLayout>
    )
}
