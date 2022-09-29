import { BigNumber, ethers } from 'ethers'
import { Box, Text } from 'grommet'
import {
    getCollectionId,
    getPositionId,
} from '@cambrian/app/utils/helpers/ctHelpers'
import { useCallback, useEffect, useState } from 'react'

import { BASE_SOLVER_IFACE } from 'packages/app/config/ContractInterfaces'
import CTFContract from '@cambrian/app/contracts/CTFContract'
import { ConditionStatus } from '@cambrian/app/models/ConditionStatus'
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

type PositionSolverInfoType = {
    collateralToken: TokenModel
    parentCollectionId: string
    conditionId: string
    partition: number[]
    solverMetadata?: SolverMetadataModel
    positionId: string
}

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

        const redemptionCache: { [conditionId: string]: boolean } = {}
        const solverCache: {
            [solverAddress: string]: PositionSolverInfoType
        } = {}
        const positions: {
            [positionId: string]: PositionSolverInfoType & {
                amount: BigNumber
                solverAddress: string
            }
        } = {}

        // For getting payouts the user has already redeemed
        const payoutRedemptionLogs = await ctf.contract.queryFilter(
            ctf.contract.filters.PayoutRedemption(
                connectedWallet.address, // redeemer
                null, // collateralToken
                null // parentCollectionID
            )
        )

        // Hash with already redeemed conditionId's
        payoutRedemptionLogs.forEach((log) => {
            if (!redemptionCache[log.args![3]])
                redemptionCache[log.args![3]] = true
        })

        // Find all the conditional tokens that have ever been sent to our connected user's address
        const transferBatchFilter = ctf.contract.filters.TransferBatch(
            null, // operator
            null, // from
            connectedWallet.address // to
        )

        const transferBatchLogs = await ctf.contract.queryFilter(
            transferBatchFilter
        )

        await Promise.all(
            transferBatchLogs.map(async (log) => {
                const solverAddress = log.args![0]
                const positionIds: BigNumber[] = log.args![3]
                const values: BigNumber[] = log.args![4]

                if (!solverCache[solverAddress]) {
                    try {
                        const newSolverContract = new ethers.Contract(
                            solverAddress,
                            BASE_SOLVER_IFACE,
                            connectedWallet.signer
                        )
                        const solverConfig = await newSolverContract.getConfig()
                        const allConditions =
                            await newSolverContract.getConditions()
                        const latestCondition =
                            allConditions[allConditions.length - 1]
                        // Check if already redeemed
                        if (!redemptionCache[latestCondition.conditionId]) {
                            const solverStatus =
                                await newSolverContract.getStatus(
                                    allConditions.length - 1
                                )
                            if (
                                solverStatus ===
                                    ConditionStatus.OutcomeReported ||
                                solverStatus ===
                                    ConditionStatus.ArbitrationDelivered
                            ) {
                                const collateralToken = await fetchTokenInfo(
                                    solverConfig.conditionBase.collateralToken,
                                    connectedWallet.web3Provider
                                )

                                const positionId = getPositionId(
                                    collateralToken.address,
                                    getCollectionId(
                                        latestCondition.conditionId,
                                        getIndexSetFromBinaryArray(
                                            latestCondition.payouts
                                        )
                                    )
                                )

                                let solverMetadata:
                                    | SolverMetadataModel
                                    | undefined = undefined
                                // Fetch Solver Metadata
                                const proposalId =
                                    await newSolverContract.trackingId()
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
                                            (await newSolverContract.chainIndex()) as
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
                                solverCache[solverAddress] = {
                                    collateralToken: collateralToken,
                                    partition:
                                        solverConfig.conditionBase.partition,
                                    conditionId: latestCondition.conditionId,
                                    parentCollectionId:
                                        latestCondition.parentCollectionId,
                                    solverMetadata: solverMetadata,
                                    positionId: positionId,
                                }
                            }
                        }
                    } catch (e) {
                        throw e
                    }
                }
                if (solverCache[solverAddress]) {
                    positionIds.forEach((positionId, idx) => {
                        const positionIdHex = positionId.toHexString()
                        if (
                            solverCache[solverAddress].positionId ===
                            positionIdHex
                        ) {
                            if (positions[positionIdHex]) {
                                // Just add amount
                                positions[positionIdHex] = {
                                    ...positions[positionIdHex],
                                    amount: positions[positionIdHex].amount.add(
                                        values[idx]
                                    ),
                                }
                            } else {
                                positions[positionIdHex] = {
                                    ...solverCache[solverAddress],
                                    solverAddress: solverAddress,
                                    amount: values[idx],
                                }
                            }
                        }
                    })
                }
            })
        )
        setRedeemablePositions(positions)
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
