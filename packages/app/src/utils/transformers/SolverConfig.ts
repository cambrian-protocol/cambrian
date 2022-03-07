import { ethers } from 'ethers'
import _ from 'lodash'

import {
    ComposerSolverModel,
    SolverModel,
} from '@cambrian/app/models/SolverModel'
import {
    ComposerSolverConfigModel,
    SolverConfigModel,
} from '@cambrian/app/models/SolverConfigModel'
import {
    ComposerConditionModel,
    ConditionModel,
} from '@cambrian/app/models/ConditionModel'
import { AllocationPathsType } from '@cambrian/app/models/AllocationModel'
import { ComposerSlotModel, SlotModel } from '@cambrian/app/models/SlotModel'
import {
    OutcomeCollectionModel,
    OutcomeModel,
} from '@cambrian/app/models/OutcomeModel'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'

import { getBytes32FromMultihash } from '@cambrian/app/utils/helpers/multihash'
import { getSolverHierarchy } from '../helpers/solverHelpers'
import { TokenAPI } from '@cambrian/app/services/api/Token.api'
import { SolverMetaDataModel } from '../../models/SolverMetaDataModel'

export async function parseComposerSolvers(
    composerSolvers: ComposerSolverModel[]
): Promise<SolverModel[] | undefined> {
    if (composerSolvers.length === 0) {
        console.error('No Solver existent.')
        return undefined
    }

    if (composerSolvers[0].config.collateralToken === undefined) {
        console.error('No collateral token defined.')
        return undefined
    }

    const collateralToken = await TokenAPI.getTokenInfo(
        composerSolvers[0].config.collateralToken
    )

    const sortedSolvers = getSolverHierarchy(
        composerSolvers[0],
        composerSolvers
    )

    if (composerSolvers.length !== sortedSolvers.length) {
        console.error(
            'Error building hierarchy of Solvers. Is every Solver connected?'
        ) // Todo error context?
        return undefined
    }

    // TODO OutcomeCollections
    const solvers: SolverModel[] = sortedSolvers.map((solver, index) => {
        return {
            collateralToken: collateralToken,
            collateralBalance: 0,
            slotsHistory: {},
            timelocksHistory: {},
            outcomeCollections: {},
            metaData: parseMetaData(sortedSolvers[index]),
            conditions: [],
            config: parseComposerSolverConfig(
                solver.config,
                index,
                sortedSolvers
            ),
        }
    })

    return solvers
}

export function parseMetaData(
    composerSolver: ComposerSolverModel
): SolverMetaDataModel {
    return {
        title: composerSolver.title,
        description: 'TODO',
        customUIULID: 'TODO',
        version: '1.0',
        tags: composerSolver.tags,
    }
}

export function parseComposerSolverConfig(
    composerSolverConfig: ComposerSolverConfigModel,
    currentSolverIndex: number,
    sortedSolvers: ComposerSolverModel[]
): SolverConfigModel {
    const ingests = Object.keys(composerSolverConfig.slots).map((slotId) =>
        parseComposerSlot(composerSolverConfig.slots[slotId], sortedSolvers)
    )

    const conditionBase = parseComposerCondition(
        composerSolverConfig.condition,
        currentSolverIndex,
        sortedSolvers
    )

    const solver = {
        implementation: composerSolverConfig.implementation
            ? composerSolverConfig.implementation
            : '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707', // IMPORTANT WARNING: REPLACE THIS BEFORE PROD // hardhat BasicSolverV1 deployment address
        keeper: composerSolverConfig.keeperAddress.address,
        arbitrator: composerSolverConfig.arbitratorAddress?.address
            ? composerSolverConfig.arbitratorAddress.address
            : ethers.constants.AddressZero,
        timelockSeconds: composerSolverConfig.timelockSeconds
            ? composerSolverConfig.timelockSeconds
            : 0,
        data: composerSolverConfig.data
            ? ethers.utils.defaultAbiCoder.encode(
                  ['bytes'],
                  [composerSolverConfig.data]
              )
            : ethers.constants.HashZero,
        ingests: ingests,
        conditionBase: conditionBase,
    }

    return solver
}

export function parseComposerSlot(
    inSlot: ComposerSlotModel,
    sortedSolvers: ComposerSolverModel[]
): SlotModel {
    const outSlot = <SlotModel>{
        executions: 0,
        ingestType: inSlot.slotType,
        slot: ethers.utils.formatBytes32String(inSlot.id),
    }

    switch (inSlot.slotType) {
        case 0: // Callback slot
            if (
                inSlot.data.length !== 1 ||
                inSlot.dataTypes.length !== 1 ||
                inSlot.dataTypes[0] !== SolidityDataTypes.Bytes32
            ) {
                throw new Error(
                    'Callback slots should have exactly 1 Bytes32 data element'
                )
            }
            if (inSlot.targetSolverId === undefined) {
                throw new Error('Function slots must have targetSolverId')
            }

            outSlot.solverIndex = sortedSolvers.findIndex(
                (x) => x.id === inSlot.targetSolverId
            )
            outSlot.data = ethers.utils.formatBytes32String(inSlot.data[0])
            break

        case 1: // Constant slot
            if (inSlot.data.length !== 1 || inSlot.dataTypes.length !== 1) {
                throw 'Constant slots should have exactly 1 data element'
            }

            outSlot.solverIndex = 0
            outSlot.data = ethers.utils.defaultAbiCoder.encode(
                [inSlot.dataTypes[0]],
                [inSlot.data[0]]
            )
            break

        case 2: // Function slot
            if (inSlot.data.length != inSlot.dataTypes.length) {
                throw 'Function slots must have matching length for data and dataTypes'
                break
            }
            if (inSlot.targetSolverId === undefined) {
                throw 'Function slots must have targetSolverId'
                break
            }
            if (!inSlot.solverFunction) {
                throw 'Function slots must have solverFunction'
                break
            }
            outSlot.solverIndex = sortedSolvers.findIndex(
                (x) => x.id === inSlot.targetSolverId
            )

            const newData = sortedSolvers
                .find((x) => x.id === inSlot.targetSolverId)
                ?.iface.encodeFunctionData(inSlot.solverFunction.name, [
                    ...inSlot.data,
                ])

            if (newData) {
                outSlot.data = newData
            } else {
                throw new Error('Invalid slot data. Target solver not found')
            }
            break

        case 3: // Manual slot
            outSlot.solverIndex = 0
            outSlot.data = ethers.constants.HashZero
            break
    }

    return outSlot
}

export function parseComposerCondition(
    inCondition: ComposerConditionModel,
    currentSolverIndex: number,
    sortedSolvers: ComposerSolverModel[]
): ConditionModel {
    const outCondition = <ConditionModel>{}

    if (inCondition.outcomes.length < 2) {
        throw 'Condition must have at least two outcomes'
    }

    if (!inCondition.parentCollection && currentSolverIndex > 0) {
        throw 'Conditions of child Solvers must target a parentCollection'
    }

    if (
        inCondition.parentCollection &&
        inCondition.parentCollection.solverId &&
        inCondition.parentCollection.solverId !==
            sortedSolvers[currentSolverIndex - 1].id
    ) {
        throw 'parentCollectionIndex refers to a Solver which is not the immediate parent'
    }

    if (
        inCondition.parentCollection?.ocId &&
        inCondition.parentCollection.solverId &&
        !sortedSolvers[currentSolverIndex - 1].config.condition.partition.find(
            (oc) => oc.id === inCondition.parentCollection?.ocId
        )
    ) {
        throw 'parentCollectionId refers to an outcome collection which is out of scope'
    }

    if (
        !sortedSolvers[currentSolverIndex].config.slots[inCondition.amountSlot]
    ) {
        throw 'amountSlot must refer to a slot on the current Solver'
    }

    if (inCondition.recipients.length < 1) {
        throw 'condition has no recipients'
    }

    if (
        inCondition.recipients.find(
            (slotPath) =>
                slotPath.solverId !== sortedSolvers[currentSolverIndex].id
        )
    ) {
        throw 'recipients must refer to slots on the current solver'
    }

    if (
        Object.keys(inCondition.recipientAmountSlots).find((key) =>
            inCondition.recipientAmountSlots[key].find(
                (recipientAmountPath) =>
                    recipientAmountPath.amount.solverId !==
                    sortedSolvers[currentSolverIndex].id
            )
        )
    ) {
        throw 'recipientAmounts must refer to slots on the current solver'
    }

    outCondition.collateralToken = '0x0165878A594ca255338adfa4d48449f69242Eb8F' // IMPORTANT WARNING: REPLACE THIS BEFORE PROD // hardhat BasicSolverV1 deployment address
    outCondition.outcomeSlots = filterOutcomes(inCondition.partition).length

    const parentSolver = sortedSolvers.find(
        (x) => x.id === inCondition.parentCollection?.solverId
    )

    const parentOC = parentSolver?.config.condition.partition.find(
        (oc) => oc.id === inCondition.parentCollection?.ocId
    )

    if (parentSolver && parentOC) {
        outCondition.parentCollectionIndexSet = getIndexSetFromBinaryArray(
            getBinaryArrayFromOC(
                parentOC,
                parentSolver.config.condition.partition
            )
        )
    } else {
        outCondition.parentCollectionIndexSet = 0
    }

    outCondition.partition = parsePartition(inCondition.partition)
    outCondition.amountSlot = ethers.utils.formatBytes32String(
        inCondition.amountSlot
    )

    outCondition.allocations = [] as AllocationPathsType[]

    inCondition.recipients.forEach((slotPath, i) => {
        outCondition.allocations.push(<AllocationPathsType>{
            recipientAddressSlot: ethers.utils.formatBytes32String(
                slotPath.slotId
            ),
            recipientAmountSlots: outCondition.partition.map((indexSet, j) => {
                const ocId = inCondition.partition.find(
                    (oc) =>
                        indexSet ===
                        getIndexSetFromBinaryArray(
                            getBinaryArrayFromOC(oc, inCondition.partition)
                        )
                )?.id
                if (ocId) {
                    const amountSlotId = inCondition.recipientAmountSlots[
                        ocId
                    ].find(
                        (alloc) => alloc.recipient.slotId === slotPath.slotId
                    )?.amount.slotId

                    if (amountSlotId) {
                        return ethers.utils.formatBytes32String(amountSlotId)
                    } else {
                        throw new Error(
                            'Could not find slot for allocation amount'
                        )
                    }
                } else {
                    throw new Error(
                        'Could not find outcome collection for allocation'
                    )
                }
            }),
        })
    })

    if (
        outCondition.allocations.find((x) => !x.recipientAddressSlot) ||
        outCondition.allocations.find((x) =>
            x.recipientAmountSlots.find((y) => !y)
        )
    ) {
        throw new Error(
            'Error during allocation: A recipient or amount slot was not found'
        )
    }

    outCondition.outcomeURIs = filterOutcomes(inCondition.partition).map((o) =>
        getBytes32FromMultihash(o.uri)
    )

    return outCondition
}

// Filter out existant outcomes which are not in an outcomeCollection
export function filterOutcomes(
    outcomeCollections: OutcomeCollectionModel[]
): OutcomeModel[] {
    let outcomes = [] as OutcomeModel[]
    outcomeCollections.forEach((oc) => {
        oc.outcomes.forEach((outcome) => {
            if (!_.find(outcomes, outcome)) {
                outcomes.push(outcome)
            }
        })
    })
    outcomes = outcomes.sort((a, b) => a.id.localeCompare(b.id)) // Order outcomes by ULID()
    return outcomes
}

// Get indexSet partition from outcomeCollections
// eg. [ ['a'],['b'],['c'] ] => [ [1,0,0],[0,1,0],[0,0,1] ] => [4,2,1]
export function parsePartition(
    outcomeCollections: OutcomeCollectionModel[]
): number[] {
    if (outcomeCollections.length < 2) {
        throw 'empty or singleton partition'
    }

    const outcomes = filterOutcomes(outcomeCollections)

    const partition = outcomeCollections.map((oc) => {
        const binaryArray = getBinaryArrayFromOC(oc, outcomeCollections)
        return getIndexSetFromBinaryArray(binaryArray) // eg. [0,1,0] => 2, eg. [1,0,0] => 1
    })

    if (!isValidPartition(partition, outcomes.length)) {
        throw 'Invalid partition'
    }

    return partition // eg. [4,2,1]
}

export function getBinaryArrayFromOC(
    OC: OutcomeCollectionModel,
    outcomeCollections: OutcomeCollectionModel[]
) {
    const outcomes = filterOutcomes(outcomeCollections)
    const binaryArray = new Array(outcomes.length).fill(0) // eg. [0,0,0]

    OC.outcomes.forEach((outcome) => {
        const i = _.indexOf(outcomes, outcome)
        if (i !== -1) {
            binaryArray[i] = 1 // eg. [0,0,0] => [0,1,0]
        } else {
            throw 'Outcome not found in filteredOutcomes'
        }
    })
    return binaryArray
}

// A B C
// 0 0 1 => 0b100 = 4
// 0 1 0 => 0b010 = 2
// 1 0 0 => 0b001 = 1
export function getIndexSetFromBinaryArray(arr: number[]): number {
    if (arr.find((x) => x > 1)) {
        throw 'Array contains non-binary values'
    } else {
        return Number('0b' + arr.slice().reverse().join(''))
    }
}

// 4 => 0b100 => 0,0,1
// 2 => 0b010 => 0,1,0
export function binaryArrayFromIndexSet(
    indexSet: number,
    outcomeSlots: number
) {
    const arr = indexSet
        .toString(2)
        .split('')
        .reverse()
        .map((x) => Number(x))

    for (let i = arr.length; i < outcomeSlots; i++) {
        arr.push(0) // Pad to outcomeSlots length
    }

    return arr
}

// Ported from @cambrianprotocol/core/ConditionalTokens.sol:splitPosition
// More information: https://docs.gnosis.io/conditionaltokens/docs/devguide03/
export function isValidPartition(
    partition: number[],
    outcomeSlotCount: number
): boolean {
    let isValid = true

    // For a condition with 4 outcomes fullIndexSet's 0b1111; for 5 it's 0b11111...
    const fullIndexSet = (1 << outcomeSlotCount) - 1
    // freeIndexSet starts as the full collection
    let freeIndexSet = fullIndexSet

    // This loop checks that all condition sets are disjoint (the same outcome is not part of more than 1 set)
    for (let i = 0; i < partition.length; i++) {
        const indexSet = partition[i]
        if (!(indexSet > 0 && indexSet < fullIndexSet)) {
            console.error('got invalid index set')
            isValid = false
        }
        if (!((indexSet & freeIndexSet) == indexSet)) {
            console.error('partition not disjoint')
            isValid = false
        }

        freeIndexSet ^= indexSet
    }

    return isValid
}
