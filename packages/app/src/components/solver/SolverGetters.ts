import { BigNumber, ethers } from 'ethers'
import {
    RichSlotsHashMapType,
    SlotModel,
    SlotsHistoryHashMapType,
} from '@cambrian/app/models/SlotModel'
import {
    SolverModel,
    SolverResponseModel,
} from '@cambrian/app/models/SolverModel'
import Stagehand, { StageNames } from '@cambrian/app/classes/Stagehand'
import {
    calculateCollectionId,
    calculatePositionId,
    getSolverIngestWithMetaData,
} from './SolverHelpers'

import { AllocationModel } from '@cambrian/app/models/AllocationModel'
import { BASE_SOLVER_IFACE } from 'packages/app/config/ContractInterfaces'
import CTFContract from '@cambrian/app/contracts/CTFContract'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { ERROR_MESSAGE } from '@cambrian/app/constants/ErrorMessages'
import { GenericMethods } from './Solver'
import { IPFSAPI } from '@cambrian/app/services/api/IPFS.api'
import { MetadataModel } from '../../models/MetadataModel'
import { MultihashType } from '@cambrian/app/models/MultihashType'
import { OutcomeCollectionsHashMapType } from '@cambrian/app/models/OutcomeCollectionModel'
import { OutcomeModel } from '@cambrian/app/models/OutcomeModel'
import { ProposalModel } from '@cambrian/app/models/ProposalModel'
import ProposalsHub from '@cambrian/app/hubs/ProposalsHub'
import { SlotTagsHashMapType } from '@cambrian/app/models/SlotTagModel'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import { SolverConfigModel } from '@cambrian/app/models/SolverConfigModel'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { TimeLocksHashMapType } from '@cambrian/app/models/TimeLocksHashMapType'
import { TokenAPI } from '@cambrian/app/services/api/Token.api'
import { UserType } from '@cambrian/app/store/UserContext'
import { binaryArrayFromIndexSet } from '@cambrian/app/utils/transformers/ComposerTransformer'
import { decodeData } from '@cambrian/app/utils/helpers/decodeData'
import { getMultihashFromBytes32 } from '@cambrian/app/utils/helpers/multihash'

export const getSolverConfig = async (
    contract: ethers.Contract
): Promise<SolverConfigModel> => {
    try {
        const res: SolverResponseModel = await contract.getConfig()

        const parsedIngests = res.ingests.map((ingest) => {
            return {
                ...ingest,
                executions: ingest.executions.toNumber(),
                solverIndex: ingest.solverIndex.toNumber(),
            }
        })

        const parsedPartition = res.conditionBase.partition.map((indexSet) =>
            indexSet.toNumber()
        )
        const parsedCondition = {
            ...res.conditionBase,
            partition: parsedPartition,
        }

        return {
            ...res,
            ingests: parsedIngests,
            conditionBase: parsedCondition,
        }
    } catch (e) {
        console.error(e)
        return Promise.reject()
    }
}

export const getSolverConditions = async (
    contract: ethers.Contract
): Promise<SolverContractCondition[]> => {
    try {
        const res: Omit<SolverContractCondition, 'executions'>[] =
            await contract.getConditions()

        return res.map((condition, idx) => {
            return {
                ...condition,
                payouts: condition.payouts.map((x) => Number(x.toString())),
                executions: idx + 1,
            }
        })
    } catch (e) {
        console.error(e)
        return Promise.reject()
    }
}

export const getSolverTimelocks = async (
    solverContract: ethers.Contract,
    conditions: SolverContractCondition[]
): Promise<TimeLocksHashMapType> => {
    const timeLocksHashMap: TimeLocksHashMapType = {}
    conditions.forEach(async (condition, idx) => {
        const timelock = await solverContract.timelocks(idx)
        timeLocksHashMap[condition.conditionId] = timelock.toNumber()
    })

    return timeLocksHashMap
}

export const getSolverOutcomes = async (solverConfig: SolverConfigModel) => {
    const outcomeURIs = solverConfig.conditionBase.outcomeURIs.map(
        (multiHash: MultihashType) => getMultihashFromBytes32(multiHash)
    )

    const outcomes = (await Promise.all(
        outcomeURIs.map((outcomeURI: string | null) => {
            const ipfs = new IPFSAPI()
            if (outcomeURI) return ipfs.getFromCID(outcomeURI)
        })
    )) as OutcomeModel[]

    return outcomes
}

export const getSolverOutcomeCollections = async (
    config: SolverConfigModel,
    conditions: SolverContractCondition[],
    slotHistory: SlotsHistoryHashMapType,
    slotTags?: SlotTagsHashMapType,
    storedOutcomes?: OutcomeModel[],
    numMintedTokensByCondition?: {
        [conditionId: string]: BigNumber
    }
): Promise<OutcomeCollectionsHashMapType> => {
    const outcomeCollectionsHashMap: OutcomeCollectionsHashMapType = {}

    const outcomes = storedOutcomes
        ? storedOutcomes
        : await getSolverOutcomes(config)

    conditions.forEach((condition) => {
        outcomeCollectionsHashMap[condition.conditionId] =
            config.conditionBase.partition.map((indexSet, idx) => {
                const outcomeCollection: OutcomeModel[] = []
                const binaryArray = binaryArrayFromIndexSet(
                    indexSet,
                    config.conditionBase.outcomeSlots
                )
                binaryArray.forEach((binary, idx) => {
                    if (binary === 1) {
                        outcomeCollection.push(outcomes[idx])
                    }
                })
                const allocations: AllocationModel[] =
                    config.conditionBase.allocations.map((allocation) => {
                        const addressSlot =
                            slotHistory[condition.conditionId][
                                allocation.recipientAddressSlot
                            ]
                        const amountSlot =
                            slotHistory[condition.conditionId][
                                allocation.recipientAmountSlots[idx]
                            ]

                        const amount = BigNumber.from(
                            decodeData(
                                [SolidityDataTypes.Uint256],
                                amountSlot.slot.data
                            )
                        )

                        let amountPercentage = amount.toNumber() / 100
                        if (amountPercentage % 1) amountPercentage.toFixed(2)

                        let mintedAmountWei
                        if (
                            numMintedTokensByCondition &&
                            numMintedTokensByCondition[condition.conditionId] &&
                            !numMintedTokensByCondition[
                                condition.conditionId
                            ].isZero() &&
                            !amount.isZero()
                        ) {
                            mintedAmountWei =
                                numMintedTokensByCondition[
                                    condition.conditionId
                                ].mul(amount)
                        }

                        const positionId = calculatePositionId(
                            config.conditionBase.collateralToken,
                            calculateCollectionId(
                                condition.conditionId,
                                indexSet
                            )
                        )

                        return {
                            addressSlot:
                                addressSlot ||
                                getSolverIngestWithMetaData(
                                    allocation.recipientAddressSlot,
                                    config.ingests,
                                    slotTags
                                ),
                            amountPercentage: amountPercentage.toString(),
                            positionId: positionId,
                            amount: mintedAmountWei,
                        }
                    })

                return {
                    indexSet: indexSet,
                    outcomes: outcomeCollection,
                    allocations: allocations,
                }
            })
    })

    return outcomeCollectionsHashMap
}

export const getSolverChain = async (
    currentUser: UserType,
    solverContract: ethers.Contract
) => {
    const children = await getChainDirection(
        currentUser,
        solverContract,
        'children'
    )
    const parents = await getChainDirection(
        currentUser,
        solverContract,
        'parents'
    )

    return [...children, solverContract.address, ...parents]
}

export const getChainDirection = async (
    currentUser: UserType,
    contract: ethers.Contract,
    direction: 'children' | 'parents'
) => {
    let nextContract = contract
    let fetchMethod =
        direction === 'children'
            ? nextContract.functions.chainChild
            : nextContract.functions.chainParent

    const addresses: string[] = []
    let fetchedAddress = await fetchMethod()
    while (
        fetchedAddress !== '0x0000000000000000000000000000000000000000' &&
        ethers.utils.isAddress(fetchedAddress)
    ) {
        addresses.push(fetchedAddress)
        nextContract = new ethers.Contract(
            fetchedAddress,
            BASE_SOLVER_IFACE,
            currentUser.signer
        )
        fetchMethod =
            direction === 'children'
                ? nextContract.functions.chainChild
                : nextContract.functions.chainParent

        fetchedAddress = await nextContract.chainParent()
    }
    return addresses
}

// Improvement - reference by conditionId instead of executions
export const getSolverSlots = async (
    solverContract: ethers.Contract,
    ingests: SlotModel[],
    conditions: SolverContractCondition[],
    slotTags?: SlotTagsHashMapType
): Promise<SlotsHistoryHashMapType> => {
    const slotsHistory: SlotsHistoryHashMapType = {}
    const currentSlotData = await Promise.all(
        ingests.map(async (ingest: SlotModel) => {
            const dataArr: any[] = await solverContract.getAllData(ingest.slot)
            const slotHistory = dataArr.map((data, idx) => {
                return {
                    slot: ingest.slot,
                    executions: idx + 1,
                    solverIndex: ingest.solverIndex,
                    ingestType: ingest.ingestType,
                    data: data,
                }
            })
            return slotHistory
        })
    )
    conditions.forEach((condition) => {
        const data: RichSlotsHashMapType = {}
        currentSlotData.forEach((slot) => {
            const currentSlot = slot.find(
                (el) => el.executions === condition.executions
            )

            if (currentSlot) {
                // Enrich slot with Metadata
                const ulid = ethers.utils.parseBytes32String(currentSlot.slot)

                // Fallback empty Slot
                data[currentSlot.slot] = {
                    slot: currentSlot,
                    tag: slotTags
                        ? slotTags[ulid]
                        : {
                              id: ulid,
                              label: '',
                              isFlex: false,
                              description: '',
                          },
                }
            }
        })
        slotsHistory[condition.conditionId] = data
    })
    return slotsHistory
}

export const getSolverNumMintedTokensForConditions = async (
    conditionalTokenFrameworkContract: ethers.Contract,
    conditions: SolverContractCondition[],
    collateralToken: string
) => {
    const numMintedByCondition = {} as {
        [conditionId: string]: BigNumber
    }
    await Promise.all(
        conditions.map(async (condition) => {
            const logs = await conditionalTokenFrameworkContract.queryFilter(
                conditionalTokenFrameworkContract.filters.PositionSplit(
                    null,
                    null,
                    condition.parentCollectionId,
                    condition.conditionId,
                    null,
                    null
                )
            )

            const amount = logs
                .filter((l) => l.args?.collateralToken === collateralToken)
                .map((l) => l.args?.amount)
                .filter(Boolean)
                .reduce((x, y) => {
                    return BigNumber.from(x).add(BigNumber.from(y))
                }, BigNumber.from(0))

            numMintedByCondition[condition.conditionId] = amount
        })
    )

    return numMintedByCondition
}

export const getSolverData = async (
    solverContract: ethers.Contract,
    solverMethods: GenericMethods,
    currentUser: UserType,
    storedOutcomes?: OutcomeModel[],
    storedMetadata?: MetadataModel,
    solverConfig?: SolverConfigModel
): Promise<SolverModel> => {
    const config = solverConfig
        ? solverConfig
        : await getSolverConfig(solverContract)

    const conditions = await getSolverConditions(solverContract)

    const slotsHistory = await getSolverSlots(
        solverContract,
        config.ingests,
        conditions,
        storedMetadata?.slotTags
    )

    if (!currentUser.chainId)
        throw new Error(ERROR_MESSAGE['NO_WALLET_CONNECTION'])

    // ERC-1155 Conditional Token Framework
    const ctfContract = new CTFContract(
        currentUser.web3Provider,
        currentUser.chainId
    )

    const numMintedTokensByCondition =
        await getSolverNumMintedTokensForConditions(
            ctfContract.contract,
            conditions,
            config.conditionBase.collateralToken
        )

    const collateralToken = await TokenAPI.getTokenInfo(
        config.conditionBase.collateralToken,
        currentUser.web3Provider
    )

    const timelocksHistory = await getSolverTimelocks(
        solverContract,
        conditions
    )

    const collateralBalance = await solverMethods.collateralBalance()

    const outcomeCollections = await getSolverOutcomeCollections(
        config,
        conditions,
        slotsHistory,
        storedMetadata?.slotTags,
        storedOutcomes,
        numMintedTokensByCondition
    )

    return {
        config: config,
        conditions: conditions,
        timelocksHistory: timelocksHistory,
        outcomeCollections: outcomeCollections,
        slotsHistory: slotsHistory,
        numMintedTokensByCondition: numMintedTokensByCondition,
        collateralBalance: collateralBalance,
        collateralToken: collateralToken,
        solverTag: storedMetadata?.solverTag,
        slotTags: storedMetadata?.slotTags,
    }
}

/**
 * TrackingID is set to ProposalID when deployed from ProposalsHub
 * TODO, extract this logic elsewhere so that Solvers are not dependent on Proposals - Proposal Getters??
 */
export const getMetadataFromProposal = async (
    currentUser: UserType,
    solverMethods: GenericMethods
): Promise<MetadataModel | undefined> => {
    const proposalId = await solverMethods.trackingId()
    if (currentUser.chainId && currentUser.signer) {
        const proposalsHub = new ProposalsHub(
            currentUser.signer,
            currentUser.chainId
        )

        const metadataCID = await proposalsHub.getMetadataCID(proposalId)
        if (metadataCID) {
            const stagehand = new Stagehand()
            const stages = await stagehand.loadStages(
                metadataCID,
                StageNames.proposal
            )
            if (stages) {
                const metaComposition = stages.composition as CompositionModel
                if (metaComposition) {
                    const solverIndex = (await solverMethods.chainIndex()) as
                        | number
                        | undefined
                    if (solverIndex !== undefined) {
                        return {
                            slotTags:
                                metaComposition.solvers[solverIndex].slotTags,
                            solverTag:
                                metaComposition.solvers[solverIndex].solverTag,
                            stages: stages,
                        }
                    }
                }
            }
        }
    }
}
