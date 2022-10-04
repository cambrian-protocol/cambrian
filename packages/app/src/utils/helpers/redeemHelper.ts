import { BigNumber, ethers } from 'ethers'
import { getCollectionId, getPositionId } from './ctHelpers'

import { BASE_SOLVER_IFACE } from 'packages/app/config/ContractInterfaces'
import CTFContract from '@cambrian/app/contracts/CTFContract'
import { ConditionStatus } from '@cambrian/app/models/ConditionStatus'
import { SolverMetadataModel } from '@cambrian/app/models/SolverMetadataModel'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { fetchTokenInfo } from './tokens'
import { getIndexSetFromBinaryArray } from '../transformers/ComposerTransformer'
import { getSolverMetadata } from '@cambrian/app/components/solver/SolverGetters'

export type RedeemablePositionsHash = {
    [positionId: string]: RedeemablePosition
}

type PositionSolverInfoType = {
    collateralToken: TokenModel
    parentCollectionId: string
    conditionId: string
    partition: number[]
    solverMetadata?: SolverMetadataModel
    positionId: string
}

export type RedeemablePosition = PositionSolverInfoType & {
    amount: BigNumber
    solverAddress: string
}

export const getRedeemablePositions = async (
    address: string,
    signerOrProvider: ethers.Signer | ethers.providers.Provider,
    chainId: number
): Promise<RedeemablePositionsHash> => {
    const ctfContract = new CTFContract(signerOrProvider, chainId)

    const redemptionCache: { [conditionId: string]: boolean } = {}
    const solverCache: {
        [solverAddress: string]: PositionSolverInfoType
    } = {}
    const positions: RedeemablePositionsHash = {}

    // For getting payouts the user has already redeemed
    const payoutRedemptionLogs = await ctfContract.contract.queryFilter(
        ctfContract.contract.filters.PayoutRedemption(
            address, // redeemer
            null, // collateralToken
            null // parentCollectionID
        )
    )

    // Hash with already redeemed conditionId's
    payoutRedemptionLogs.forEach((log) => {
        if (!redemptionCache[log.args![3]]) redemptionCache[log.args![3]] = true
    })

    // Find all the conditional tokens that have ever been sent to our connected user's address
    const transferBatchFilter = ctfContract.contract.filters.TransferBatch(
        null, // operator
        null, // from
        address // to
    )

    const transferBatchLogs = await ctfContract.contract.queryFilter(
        transferBatchFilter
    )

    await Promise.all(
        transferBatchLogs.map(async (log) => {
            const solverAddress = log.args![0]
            const positionIds: BigNumber[] = log.args![3]
            const values: BigNumber[] = log.args![4]

            if (!solverCache[solverAddress]) {
                try {
                    const solverContract = new ethers.Contract(
                        solverAddress,
                        BASE_SOLVER_IFACE,
                        signerOrProvider
                    )
                    const solverConfig = await solverContract.getConfig()
                    const allConditions = await solverContract.getConditions()
                    const latestCondition =
                        allConditions[allConditions.length - 1]
                    // Check if already redeemed
                    if (!redemptionCache[latestCondition.conditionId]) {
                        const solverStatus = await solverContract.getStatus(
                            allConditions.length - 1
                        )
                        if (
                            solverStatus === ConditionStatus.OutcomeReported ||
                            solverStatus ===
                                ConditionStatus.ArbitrationDelivered
                        ) {
                            const collateralToken = await fetchTokenInfo(
                                solverConfig.conditionBase.collateralToken,
                                signerOrProvider
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

                            const solverMetadata = await getSolverMetadata(
                                solverContract,
                                signerOrProvider,
                                chainId
                            )

                            solverCache[solverAddress] = {
                                collateralToken: collateralToken,
                                partition: solverConfig.conditionBase.partition,
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
                            positionIdHex &&
                        values[idx].gt(0)
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

    return positions
}
