import {
    ComposerSlotPathType,
    RichSlotModel,
    SlotModel,
} from '@cambrian/app/models/SlotModel'
import {
    OutcomeCollectionInfoType,
    RecipientAllocationInfoType,
} from '@cambrian/app/components/info/solver/BaseSolverInfo'

import ComposerSolver from '@cambrian/app/classes/ComposerSolver'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { GenericMethods } from '@cambrian/app/components/solver/Solver'
import { OutcomeCollectionModel } from '@cambrian/app/models/OutcomeCollectionModel'
import { PriceModel } from '@cambrian/app/components/bars/actionbars/proposal/ProposalReviewActionbar'
import { SlotTagsHashMapType } from '@cambrian/app/models/SlotTagModel'
import { SlotType } from '@cambrian/app/models/SlotType'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { decodeData } from './decodeData'
import { ethers } from 'ethers'
import { parseBytes32String } from 'ethers/lib/utils'

// Returns a sorted hierarchy containing the selected solver
export function getSolverHierarchy(
    currentSolver: ComposerSolver,
    solvers: ComposerSolver[]
): ComposerSolver[] {
    const parents = addParentsRecursive(currentSolver, solvers, [])
    const children = addChildrenRecursive(currentSolver, solvers, [])
    const hierarchy = parents.concat([currentSolver]).concat(children)
    return hierarchy
}

function addParentsRecursive(
    currentSolver: ComposerSolver,
    solvers: ComposerSolver[],
    parents: ComposerSolver[]
): ComposerSolver[] {
    const parent = solvers.find(
        (x) =>
            x.id === currentSolver.config.condition.parentCollection?.solverId
    )
    if (parent) {
        if (parents.find((x) => x.id === parent.id)) {
            return parents // infinite loop protection
        } else {
            parents.unshift(parent)
            return addParentsRecursive(parent, solvers, parents)
        }
    }

    return parents
}

function addChildrenRecursive(
    currentSolver: ComposerSolver,
    solvers: ComposerSolver[],
    children: ComposerSolver[]
): ComposerSolver[] {
    const child = solvers.find(
        (x) =>
            x.config.condition.parentCollection?.solverId === currentSolver.id
    )
    if (child) {
        if (children.find((x) => x.id === child.id)) {
            return children // infinite loop protection
        } else {
            children.push(child)
            return addChildrenRecursive(child, solvers, children)
        }
    }

    return children
}

export const calculatePositionId = (
    collateralTokenAddress: string,
    collectionId: string
) => {
    return ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
            ['address', 'bytes32'],
            [collateralTokenAddress, collectionId]
        )
    )
}

export const calculateCollectionId = (
    conditionId: string,
    indexSet: number
) => {
    return ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
            ['bytes32', 'uint256'],
            [conditionId, indexSet]
        )
    )
}

export const getSolverIngestWithMetaData = (
    slotId: string,
    ingests: SlotModel[],
    slotTags?: SlotTagsHashMapType
): RichSlotModel => {
    const ingestSlot = ingests.find((ingest) => ingest.slot === slotId)
    if (ingestSlot) {
        // Enrich with MetaData
        const ulid = ethers.utils.parseBytes32String(ingestSlot.slot)

        // Fallback empty Slot
        const tag =
            slotTags && slotTags[ulid]
                ? slotTags[ulid]
                : {
                      id: ulid,
                      label: '',
                      isFlex: false,
                      description: '',
                  }

        return {
            slot: ingestSlot,
            tag: tag,
        }
    } else {
        throw new Error(`Error while finding ingest with slotId: ${slotId}`)
    }
}

export const getSolverRecipientSlots = (
    solverData: SolverModel,
    condition: SolverContractCondition
): RichSlotModel[] => {
    return solverData.config.conditionBase.allocations.map(
        (allocation) =>
            solverData.slotsHistory[condition.conditionId][
                allocation.recipientAddressSlot
            ] ||
            getSolverIngestWithMetaData(
                allocation.recipientAddressSlot,
                solverData.config.ingests,
                solverData.slotTags
            )
    )
}

export const getSolverRecipientAddressHashmap = (
    solverData: SolverModel,
    condition: SolverContractCondition
) => {
    const recipientSlotArray = getSolverRecipientSlots(solverData, condition)

    const recipientAddressHashmap: {
        [recipientAddress: string]: RichSlotModel
    } = {}

    recipientSlotArray.forEach((recipientSlot) => {
        const decodedAddress = decodeData(
            [SolidityDataTypes.Address],
            recipientSlot.slot.data
        )
        recipientAddressHashmap[decodedAddress] = recipientSlot
    })

    return recipientAddressHashmap
}

export const getManualInputs = (
    solverData: SolverModel,
    currentCondition: SolverContractCondition
): RichSlotModel[] => {
    if (!solverData.slotTags) return []
    const existantSlots = solverData.slotsHistory[currentCondition.conditionId]
    return solverData.config.ingests
        .filter((ingest) => ingest.ingestType === SlotType.Manual)
        .map((ingest) => {
            // If there is already an existant slot, grab this one with the contained data
            return (
                existantSlots[ingest.slot] || {
                    slot: ingest,
                    tag: solverData.slotTags![parseBytes32String(ingest.slot)],
                }
            )
        })
}

export const getManualSlots = (solverData: SolverModel): RichSlotModel[] => {
    return solverData.config.ingests.reduce(
        (filtered: RichSlotModel[], ingest) => {
            if (ingest.ingestType === SlotType.Manual) {
                filtered.push(
                    getSolverIngestWithMetaData(
                        ingest.slot,
                        solverData.config.ingests,
                        solverData.slotTags
                    )
                )
            }
            return filtered
        },
        []
    )
}

// TODO Proper typescript. Would be nice to know params from the function fragment. TypeChain integration?
export const getSolverMethods = (
    iface: ethers.utils.Interface,
    call: Function
) => {
    const methods = {} as GenericMethods

    Object.values(iface.functions).forEach((value) => {
        const inputs = value.inputs.map((i) =>
            Object.values(SolidityDataTypes).find(
                (k) =>
                    k ==
                    Object.keys(SolidityDataTypes)[
                        /* @ts-ignore */
                        Object.values(SolidityDataTypes).indexOf(i.type)
                    ]
            )
        )

        methods[value.name] = (...args: [typeof inputs]) =>
            call(value.name, ...args)
    })

    return methods
}

export const getOutcomeCollectionsInfoFromCeramicData = (
    composerSolver: ComposerSolver,
    composition: CompositionModel,
    price: PriceModel
): OutcomeCollectionInfoType[] => {
    return composerSolver.config.condition.partition.map((p) => {
        const recipientAmounts =
            composerSolver.config.condition.recipientAmountSlots[p.id]

        const _recipientAllocations: RecipientAllocationInfoType[] =
            recipientAmounts.map((recipientAmount) => {
                const recipientInfo = getRecipientInfoFromComposer(
                    recipientAmount.recipient,
                    composerSolver,
                    composition
                )

                const allocation = getAmountInfoFromComposer(
                    recipientAmount.amount,
                    composerSolver,
                    composition,
                    price.amount
                )

                return {
                    allocation: allocation,
                    recipient: recipientInfo,
                }
            })

        return {
            outcomes: p.outcomes,
            recipientAllocations: _recipientAllocations,
        }
    })
}

export const getRecipientInfoFromComposer = (
    recipientSlotPath: ComposerSlotPathType,
    currentComposerSolver: ComposerSolver,
    composition: CompositionModel
) => {
    return {
        slotTag: currentComposerSolver.slotTags[recipientSlotPath.slotId],
        address: getComposerSlotData(
            recipientSlotPath,
            currentComposerSolver,
            composition
        ),
    }
}

export const getAmountInfoFromComposer = (
    amountSlotPath: ComposerSlotPathType,
    currentComposerSolver: ComposerSolver,
    composition: CompositionModel,
    price?: number
) => {
    const percentage =
        getComposerSlotData(
            amountSlotPath,
            currentComposerSolver,
            composition
        ) / 100
    return {
        percentage: percentage.toString(),
        amount: price ? (price * percentage) / 100 : 0,
    }
}

export const getComposerSlotData = (
    slotPath: ComposerSlotPathType,
    currentComposerSolver: ComposerSolver,
    composition: CompositionModel
) => {
    try {
        let currentSolver: ComposerSolver | undefined = currentComposerSolver
        if (slotPath.solverId !== currentSolver.id) {
            currentSolver = composition.solvers.find(
                (solver) => solver.id === slotPath.solverId
            )
            if (!currentSolver) throw new Error('Solver ID not found!')
        }
        const slot = currentSolver.config.slots[slotPath.slotId]
        let data
        if (slot.reference) {
            if (slot.reference.solverId !== currentSolver.id) {
                currentSolver = composition.solvers.find(
                    (solver) => solver.id === slot.reference?.solverId
                )
                if (!currentSolver) throw new Error('Solver ID not found!')
            }
            if (slot.reference.slotId === 'keeper') {
                data = currentSolver.config.keeperAddress
            } else if (slot.reference.slotId === 'arbitrator') {
                data = currentSolver.config.arbitratorAddress
            } else {
                data = currentSolver.config.slots[slot.reference.slotId].data[0]
            }
        } else {
            data = slot.data[0]
        }
        return data
    } catch (e) {
        cpLogger.push(e)
    }
}

export const getOutcomeCollectionsInfosFromContractData = (
    solverContractData: SolverModel,
    contractCondition: SolverContractCondition
): OutcomeCollectionInfoType[] => {
    return solverContractData.outcomeCollections[
        contractCondition.conditionId
    ].map((outcomeCollection) => {
        const balance =
            solverContractData.numMintedTokensByCondition &&
            solverContractData.numMintedTokensByCondition[
                contractCondition.conditionId
            ]
                ? solverContractData.numMintedTokensByCondition[
                      contractCondition.conditionId
                  ]
                : solverContractData.collateralBalance

        return getOutcomeCollectionInfoFromContractData(
            outcomeCollection,
            Number(
                ethers.utils.formatUnits(
                    balance,
                    solverContractData.collateralToken.decimals
                )
            )
        )
    })
}

export const getOutcomeCollectionInfoFromContractData = (
    contractOutcomeCollection: OutcomeCollectionModel,
    balance: number
): OutcomeCollectionInfoType => {
    const _recipientAllocations: RecipientAllocationInfoType[] =
        contractOutcomeCollection.allocations.map((recipientAllocation) => {
            return {
                recipient: {
                    address: decodeData(
                        [SolidityDataTypes.Address],
                        recipientAllocation.addressSlot.slot.data
                    ),
                    slotTag: recipientAllocation.addressSlot.tag,
                },
                allocation: {
                    percentage: recipientAllocation.amountPercentage,
                    amount:
                        (balance *
                            Number(recipientAllocation.amountPercentage)) /
                        100,
                },
            }
        })

    return {
        outcomes: contractOutcomeCollection.outcomes,
        recipientAllocations: _recipientAllocations,
    }
}
