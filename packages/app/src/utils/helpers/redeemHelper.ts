import { BigNumber, ethers } from 'ethers'
import { getCollectionId, getPositionId } from './ctHelpers'

import { BASE_SOLVER_IFACE } from 'packages/app/config/ContractInterfaces'
import CTFContract from '@cambrian/app/contracts/CTFContract'
import { ConditionStatus } from '@cambrian/app/models/ConditionStatus'
import IPFSSolutionsHub from '@cambrian/app/hubs/IPFSSolutionsHub'
import ProposalsHub from '@cambrian/app/hubs/ProposalsHub'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverMetadataModel } from '@cambrian/app/models/SolverMetadataModel'
import { TokenAPI } from '@cambrian/app/services/api/Token.api'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { UserType } from '@cambrian/app/store/UserContext'
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

export type ReclaimablePositionType = {
    positionId: string
    totalReclaimable: BigNumber
    funderAmount: BigNumber
    funderReclaimed: BigNumber
    funderReclaimableAmount: BigNumber
    percentage: string
    conditionId: string
}

export type ReclaimableTokensType = {
    proposalId: string
    totalFunding: BigNumber
    collateralToken: TokenModel
    reclaimableSolvers: ReclaimableSolversMap
}

type ReclaimableSolversMap = {
    [solverAddress: string]: ReclaimablePositionType[]
}

export const getRedeemablePositions = async (
    currentUser: UserType
): Promise<RedeemablePositionsHash> => {
    const ctfContract = new CTFContract(currentUser.signer, currentUser.chainId)

    const redemptionCache: { [conditionId: string]: boolean } = {}
    const solverCache: {
        [solverAddress: string]: PositionSolverInfoType
    } = {}
    const positions: RedeemablePositionsHash = {}

    // For getting payouts the user has already redeemed
    const payoutRedemptionLogs = await ctfContract.contract.queryFilter(
        ctfContract.contract.filters.PayoutRedemption(
            currentUser.address, // redeemer
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
        currentUser.address // to
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
                        currentUser.signer
                    )
                    const solverConfig = await solverContract.getConfig()
                    const allConditions = await solverContract.getConditions()
                    // TODO map all conditions
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
                            const collateralToken = await TokenAPI.getTokenInfo(
                                solverConfig.conditionBase.collateralToken,
                                currentUser.web3Provider,
                                currentUser.chainId
                            )

                            const positionId =
                                await getPositionIdFromConditionResolution(
                                    ctfContract.contract,
                                    latestCondition.conditionId,
                                    solverConfig.conditionBase.collateralToken
                                )

                            if (positionId) {
                                const solverMetadata = await getSolverMetadata(
                                    solverContract,
                                    currentUser.web3Provider
                                )

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

export const getReclaimableTokensFromSolver = async (
    fromSolverAddress: string,
    conditionId: string,
    currentUser: UserType
): Promise<ReclaimableTokensType | undefined> => {
    const ctf = new CTFContract(currentUser.signer, currentUser.chainId)
    const proposalsHub = new ProposalsHub(
        currentUser.signer,
        currentUser.chainId
    )
    const solverContract = new ethers.Contract(
        fromSolverAddress,
        BASE_SOLVER_IFACE,
        currentUser.signer
    )
    const proposalId = await solverContract.trackingId()
    const proposalContract = await proposalsHub.getProposal(proposalId)
    const reclaimablePositions = await getReclaimablePositions(
        ctf.contract,
        proposalsHub.contract,
        proposalContract,
        fromSolverAddress,
        currentUser.address,
        conditionId
    )
    if (reclaimablePositions) {
        return {
            proposalId: proposalId,
            totalFunding: proposalContract.fundingGoal,
            collateralToken: await TokenAPI.getTokenInfo(
                proposalContract.collateralToken,
                currentUser.web3Provider,
                currentUser.chainId
            ),
            reclaimableSolvers: { [fromSolverAddress]: reclaimablePositions },
        }
    }
}

export const getAllReclaimableTokensFromProposal = async (
    proposalContract: ethers.Contract,
    currentUser: UserType
): Promise<ReclaimableTokensType | undefined> => {
    const ctf = new CTFContract(currentUser.signer, currentUser.chainId)
    const proposalsHub = new ProposalsHub(
        currentUser.signer,
        currentUser.chainId
    )
    const ipfsSolutionsHub = new IPFSSolutionsHub(
        currentUser.signer,
        currentUser.chainId
    )
    const solverAddresses = await ipfsSolutionsHub.getSolvers(
        proposalContract.solutionId
    )

    const reclaimableSolvers: ReclaimableSolversMap = {}

    if (solverAddresses) {
        await Promise.all(
            solverAddresses.map(async (solverAddress) => {
                const solverContract = new ethers.Contract(
                    solverAddress,
                    BASE_SOLVER_IFACE,
                    currentUser.signer
                )
                const conditions: SolverContractCondition[] =
                    await solverContract.getConditions()

                if (conditions && conditions.length > 0) {
                    await Promise.all(
                        conditions.map(async (condition) => {
                            const reclaimablePositions =
                                await getReclaimablePositions(
                                    ctf.contract,
                                    proposalsHub.contract,
                                    proposalContract,
                                    solverAddress,
                                    currentUser.address,
                                    condition.conditionId
                                )
                            if (reclaimablePositions) {
                                reclaimableSolvers[solverAddress] =
                                    reclaimablePositions
                            }
                        })
                    )
                }
            })
        )
    }

    if (Object.keys(reclaimableSolvers).length > 0) {
        return {
            proposalId: proposalContract.id,
            totalFunding: proposalContract.fundingGoal,
            collateralToken: await TokenAPI.getTokenInfo(
                proposalContract.collateralToken,
                currentUser.web3Provider,
                currentUser.chainId
            ),
            reclaimableSolvers: reclaimableSolvers,
        }
    }
}

const getReclaimablePositions = async (
    conditionalTokenContract: ethers.Contract,
    proposalsHubContract: ethers.Contract,
    proposalContract: ethers.Contract,
    fromSolverAddress: string,
    userAddress: string,
    conditionId: string
): Promise<ReclaimablePositionType[] | undefined> => {
    const transferBatchFilter = conditionalTokenContract.filters.TransferBatch(
        null, // operator
        fromSolverAddress, // from
        proposalsHubContract.address // to
    )
    const transferBatchLogs = await conditionalTokenContract.queryFilter(
        transferBatchFilter
    )

    const reclaimablePositions: ReclaimablePositionType[] = []
    await Promise.all(
        transferBatchLogs.map(async (l: any) => {
            const positionIds: BigNumber[] = l.args![3]
            const values: BigNumber[] = l.args![4]
            await Promise.all(
                values.map(async (value, idx) => {
                    const positionIdFromConditionId =
                        await getPositionIdFromConditionResolution(
                            conditionalTokenContract,
                            conditionId,
                            proposalContract.collateralToken
                        )
                    if (
                        value.gt(0) &&
                        positionIds[idx].toHexString() ===
                            positionIdFromConditionId
                    ) {
                        const funderAmount =
                            await proposalsHubContract.funderAmountMap(
                                proposalContract.id,
                                userAddress
                            )
                        if (BigNumber.from(funderAmount).gt(0)) {
                            const reclaimableTokens =
                                await proposalsHubContract.reclaimableTokens(
                                    proposalContract.id,
                                    positionIds[idx]
                                )
                            const reclaimedTokens =
                                await proposalsHubContract.reclaimedTokens(
                                    positionIds[idx],
                                    userAddress
                                )
                            const funderReclaimableAmount =
                                calculateReclaimableTokens(
                                    proposalContract.fundingGoal,
                                    funderAmount,
                                    reclaimableTokens
                                )

                            reclaimablePositions.push({
                                totalReclaimable: reclaimableTokens,
                                funderAmount: funderAmount,
                                funderReclaimed: reclaimedTokens,
                                positionId: positionIds[idx].toHexString(),
                                funderReclaimableAmount:
                                    funderReclaimableAmount.reclaimableTokens,
                                percentage: funderReclaimableAmount.percentage,
                                conditionId: conditionId,
                            })
                        }
                    }
                })
            )
        })
    )
    if (reclaimablePositions.length > 0) {
        return reclaimablePositions
    }
}

const calculateReclaimableTokens = (
    totalFunding: BigNumber,
    funderAmount: BigNumber,
    totalReclaimable: BigNumber
) => {
    const formattedFunderAmount = Number(ethers.utils.formatUnits(funderAmount))
    const formattedTotalFunding = Number(ethers.utils.formatUnits(totalFunding))
    const funderPercentageNumber =
        (formattedFunderAmount * 100) / formattedTotalFunding
    const formattedTotalReclaimable = Number(
        ethers.utils.formatUnits(totalReclaimable)
    )

    const reclaimableTokens =
        (funderPercentageNumber * formattedTotalReclaimable) / 100

    return {
        percentage: funderPercentageNumber.toFixed(2),
        reclaimableTokens: ethers.utils.parseUnits(
            reclaimableTokens.toString()
        ),
    }
}

const getPositionIdFromConditionResolution = async (
    ctfContract: ethers.Contract,
    conditionId: string,
    collateralTokenAddress: string
) => {
    const conditionResolutionLogs = await ctfContract.queryFilter(
        ctfContract.filters.ConditionResolution(conditionId)
    )
    if (conditionResolutionLogs.length > 0) {
        const ctfPayoutNumeratorsBN: BigNumber[] =
            conditionResolutionLogs[0].args?.payoutNumerators

        const ctfPayoutNumerators = ctfPayoutNumeratorsBN.map((numberator) =>
            numberator.toNumber()
        )

        return getPositionId(
            collateralTokenAddress,
            getCollectionId(
                conditionId,
                getIndexSetFromBinaryArray(ctfPayoutNumerators)
            )
        )
    }
}
