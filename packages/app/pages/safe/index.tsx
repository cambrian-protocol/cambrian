import { BigNumber, ethers } from 'ethers'
import { Box, Text } from 'grommet'
import { useCallback, useEffect, useState } from 'react'

import { BASE_SOLVER_IFACE } from 'packages/app/config/ContractInterfaces'
import CTFContract from '@cambrian/app/contracts/CTFContract'
import DashboardHeader from '@cambrian/app/components/layout/header/DashboardHeader'
import { INFURA_ID } from '../../config'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import ProposalsHub from '@cambrian/app/hubs/ProposalsHub'
import { SafeAppWeb3Modal } from '@gnosis.pm/safe-apps-web3modal'
import { SolverMetadataModel } from '@cambrian/app/models/SolverMetadataModel'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import WalletConnectProvider from '@walletconnect/web3-provider'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { fetchTokenInfo } from '@cambrian/app/utils/helpers/tokens'
import { getIndexSetFromBinaryArray } from '@cambrian/app/utils/transformers/ComposerTransformer'
import { loadStageStackFromID } from '@cambrian/app/services/ceramic/CeramicUtils'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'

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

type RedeemablePosition = {
    collateralToken: TokenModel
    parentCollectionId: string
    conditionId: string
    partition: number[]
    amount: BigNumber
    solverAddress: string
    solverMetadata?: SolverMetadataModel
}

type RedeemablePositionsHash = { [positionId: string]: RedeemablePosition }

export default function Safe() {
    const { currentUser } = useCurrentUserContext()
    const [connectedWallet, setConnectedWallet] = useState<ConnectedWallet>()
    const [ctf, setCtf] = useState<CTFContract>()
    const [redeemablePositions, setRedeemablePositions] =
        useState<RedeemablePositionsHash>({})

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

        const collateralTokensCache: string[] = []
        const solverCollateralTokenCache: {
            [solverAddress: string]: {
                solverContract: ethers.Contract
                collateralToken: string
                partition: number[]
            }
        } = {}
        const positionsCache: {
            [positionId: string]: {
                amount: BigNumber
                solverAddress: string
                solverContract: ethers.Contract
                partition: number[]
            }
        } = {}

        await Promise.all(
            transferBatchLogs.map(async (log) => {
                const solverAddress = log.args![0]
                const positionIds: BigNumber[] = log.args![3]
                const values: BigNumber[] = log.args![4]
                let collateralToken: string
                let solverContract: ethers.Contract
                let partition: number[]

                if (!solverCollateralTokenCache[solverAddress]) {
                    try {
                        const newSolverContract = new ethers.Contract(
                            solverAddress,
                            BASE_SOLVER_IFACE,
                            connectedWallet.signer
                        )
                        const solverConfig = await newSolverContract.getConfig()

                        collateralToken =
                            solverConfig.conditionBase.collateralToken
                        solverContract = newSolverContract
                        partition = solverConfig.conditionBase.partition

                        if (!collateralTokensCache.includes(collateralToken))
                            collateralTokensCache.push(collateralToken)

                        solverCollateralTokenCache[solverAddress] = {
                            collateralToken: collateralToken,
                            solverContract: solverContract,
                            partition: partition,
                        }
                    } catch (e) {
                        throw new Error('No Solver Config found!')
                    }
                } else {
                    solverContract =
                        solverCollateralTokenCache[solverAddress].solverContract
                    collateralToken =
                        solverCollateralTokenCache[solverAddress]
                            .collateralToken
                    partition =
                        solverCollateralTokenCache[solverAddress].partition
                }

                positionIds.forEach((positionId, idx) => {
                    const positionIdHex = positionId.toHexString()
                    if (positionsCache[positionIdHex]) {
                        // Just add amount
                        positionsCache[positionIdHex] = {
                            ...positionsCache[positionIdHex],
                            amount: positionsCache[positionIdHex].amount.add(
                                values[idx]
                            ),
                        }
                    } else {
                        positionsCache[positionIdHex] = {
                            solverAddress: solverAddress,
                            amount: values[idx],
                            solverContract: solverContract,
                            partition: partition,
                        }
                    }
                })
            })
        )

        // For getting resolved conditions
        const resolvedConditionLogs = await ctf.contract.queryFilter(
            ctf.contract.filters.ConditionResolution(null, null, null)
        )

        // For getting payouts the user has already redeemed
        const payoutRedemptionLogs = await ctf.contract.queryFilter(
            ctf.contract.filters.PayoutRedemption(
                connectedWallet.address, // redeemer
                null, // collateralToken
                null // parentCollectionID
            )
        )

        // Filter out already redeemed conditions
        const redeemableConditionLogs = resolvedConditionLogs.filter(
            (resolvedCondition) =>
                payoutRedemptionLogs.find(
                    (redeemedPayoutLog) =>
                        redeemedPayoutLog.args![3] ===
                        resolvedCondition.args![0]
                ) === undefined
        )

        const _redeemablePositions: RedeemablePositionsHash = {}

        // TODO replace getPositionId and getCollectionId with helper functions from gnosis ctf
        await Promise.all(
            redeemableConditionLogs.map(async (redeemableCondition) => {
                const conditionId = redeemableCondition.args!.conditionId
                const indexSet = getIndexSetFromBinaryArray(
                    redeemableCondition.args!.payoutNumerators
                )
                const collectionId = await ctf.contract.getCollectionId(
                    ethers.constants.HashZero,
                    conditionId,
                    indexSet
                )

                await Promise.all(
                    collateralTokensCache.map(
                        async (collateralTokenAddress) => {
                            const positionId: BigNumber =
                                await ctf.contract.getPositionId(
                                    collateralTokenAddress,
                                    collectionId
                                )
                            const positionHex = positionId.toHexString()

                            // Cross-ref calculated positionId with cached position
                            if (positionsCache[positionHex]) {
                                const collateralToken = await fetchTokenInfo(
                                    collateralTokenAddress,
                                    connectedWallet.web3Provider
                                )

                                let solverMetadata:
                                    | SolverMetadataModel
                                    | undefined = undefined
                                // Fetch Solver Metadata
                                const proposalId = await positionsCache[
                                    positionHex
                                ].solverContract.trackingId()
                                if (proposalId && currentUser) {
                                    const proposalsHub = new ProposalsHub(
                                        connectedWallet.signer,
                                        connectedWallet.network.chainId
                                    )

                                    const metadataURI =
                                        await proposalsHub.getMetadataCID(
                                            proposalId
                                        )
                                    const stageStack =
                                        await loadStageStackFromID(
                                            currentUser,
                                            metadataURI
                                        )

                                    if (stageStack) {
                                        const solverIndex =
                                            (await positionsCache[
                                                positionHex
                                            ].solverContract.chainIndex()) as
                                                | number
                                                | undefined
                                        if (solverIndex !== undefined) {
                                            solverMetadata = {
                                                slotTags:
                                                    stageStack.composition
                                                        .solvers[solverIndex]
                                                        .slotTags,
                                                solverTag:
                                                    stageStack.composition
                                                        .solvers[solverIndex]
                                                        .solverTag,
                                                stageStack: stageStack,
                                            }
                                        }
                                    }
                                }
                                _redeemablePositions[positionHex] = {
                                    ...positionsCache[positionHex],
                                    collateralToken: collateralToken,
                                    conditionId: conditionId,
                                    parentCollectionId:
                                        ethers.constants.HashZero,
                                    solverMetadata: solverMetadata,
                                }
                            }
                        }
                    )
                )
            })
        )

        setRedeemablePositions(_redeemablePositions)
    }

    const onRedeem = async (redeemablePosition: RedeemablePosition) => {
        if (ctf && connectedWallet) {
            try {
                await ctf.contract.redeemPositions(
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
