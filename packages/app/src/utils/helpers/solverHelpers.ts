import {
    ComposerSlotPathType,
    RichSlotModel,
    SlotModel,
} from '@cambrian/app/models/SlotModel'

import { AllocationModel } from '@cambrian/app/models/AllocationModel'
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
): OutcomeCollectionModel[] => {
    return composerSolver.config.condition.partition.map((p) => {
        const recipientAmounts =
            composerSolver.config.condition.recipientAmountSlots[p.id]

        const _allocations: AllocationModel[] = []

        recipientAmounts.forEach((recipientAmount) => {
            const recipientRichSlot = getComposerRichSlot(
                recipientAmount.recipient,
                composition
            )

            const allocationAmount = getAmountInfoFromComposer(
                recipientAmount.amount,
                composition,
                price
            )
            if (allocationAmount && recipientRichSlot) {
                _allocations.push({
                    amountPercentage: allocationAmount.percentage,
                    amount: allocationAmount.amount,
                    positionId: '', // Note: Not necessary for displaying ceramic data
                    addressSlot: recipientRichSlot,
                })
            }
        })

        return {
            outcomes: p.outcomes,
            allocations: _allocations,
        }
    })
}

export const getAmountInfoFromComposer = (
    amountSlotPath: ComposerSlotPathType,
    composition: CompositionModel,
    price: PriceModel
) => {
    const amountSlot = getComposerRichSlot(amountSlotPath, composition)

    if (amountSlot) {
        const percentage = Number(amountSlot.slot.data) / 100
        // Parsing amount to match contract data
        const amount = price.amount ? price.amount * percentage * 100 : 0
        const parsedAmount = ethers.utils.parseUnits(
            amount.toString(),
            price.token?.decimals
        )
        return {
            percentage: percentage.toString(),
            amount: parsedAmount,
        }
    }
}

export const getComposerRichSlot = (
    slotPath: ComposerSlotPathType,
    composition: CompositionModel
): RichSlotModel | undefined => {
    try {
        const currentSolverIndex = composition.solvers.findIndex(
            (solver) => solver.id === slotPath.solverId
        )
        if (currentSolverIndex < 0) throw new Error('Solver ID not found!')
        let currentSolver: ComposerSolver | undefined =
            composition.solvers[currentSolverIndex]
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
        return {
            tag: currentSolver.slotTags[slot.id],
            slot: {
                data:
                    data !== '' &&
                    data !== ethers.constants.AddressZero &&
                    slot.dataTypes[0] === SolidityDataTypes.Address
                        ? ethers.utils.defaultAbiCoder.encode(slot.dataTypes, [
                              data,
                          ])
                        : data,
                executions: 0,
                ingestType: slot.slotType,
                slot: slot.id,
                solverIndex: currentSolverIndex,
            },
        }
    } catch (e) {
        cpLogger.push(e)
    }
}
