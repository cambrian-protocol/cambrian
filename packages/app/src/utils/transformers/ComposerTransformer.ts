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
import { ConditionModel } from '@cambrian/app/models/ConditionModel'
import { AllocationPathsType } from '@cambrian/app/models/AllocationModel'
import { ComposerSlotModel, SlotModel } from '@cambrian/app/models/SlotModel'
import { OutcomeModel } from '@cambrian/app/models/OutcomeModel'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'

import { getSolverHierarchy } from '../helpers/solverHelpers'
import { TokenAPI } from '@cambrian/app/services/api/Token.api'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import ModuleRegistryAPI from '@cambrian/app/services/api/ModuleRegistry'
import { ComposerModuleModel } from '@cambrian/app/models/ModuleModel'
import { SUPPORTED_CHAINS } from 'packages/app/config/SupportedChains'
import { GENERAL_ERROR } from '@cambrian/app/constants/ErrorMessages'
import { ComposerOutcomeCollectionModel } from '@cambrian/app/models/OutcomeCollectionModel'

export async function parseComposerSolvers(
    composerSolvers: ComposerSolverModel[],
    provider: ethers.providers.Provider
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
        composerSolvers[0].config.collateralToken,
        provider
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

    const { chainId } = await provider.getNetwork()

    return sortedSolvers.map((solver, index) => {
        return {
            collateralToken: collateralToken,
            collateralBalance: 0,
            slotsHistory: {},
            timelocksHistory: {},
            outcomeCollections: {},
            solverTag: solver.solverTag,
            slotTags: solver.slotTags,
            conditions: [],
            config: parseComposerSolverConfig(
                solver.config,
                index,
                sortedSolvers,
                chainId
            ),
        }
    })
}

export function parseComposerSolverConfig(
    composerSolverConfig: ComposerSolverConfigModel,
    currentSolverIndex: number,
    sortedSolvers: ComposerSolverModel[],
    chainId: number
): SolverConfigModel {
    const chainData = SUPPORTED_CHAINS[chainId]
    if (!chainData || !chainData.contracts['basicSolverV1'])
        throw GENERAL_ERROR['CHAIN_NOT_SUPPORTED']

    const ingests = Object.keys(composerSolverConfig.slots).map((slotId) =>
        parseComposerSlot(composerSolverConfig.slots[slotId], sortedSolvers)
    )

    const conditionBase = parseComposerCondition(
        composerSolverConfig,
        currentSolverIndex,
        sortedSolvers
    )

    return {
        implementation: chainData.contracts['basicSolverV1'],
        keeper: composerSolverConfig.keeperAddress,
        arbitrator: composerSolverConfig.arbitratorAddress
            ? composerSolverConfig.arbitratorAddress
            : ethers.constants.AddressZero,
        timelockSeconds: composerSolverConfig.timelockSeconds
            ? composerSolverConfig.timelockSeconds
            : 0,
        moduleLoaders:
            composerSolverConfig.modules && composerSolverConfig.modules.length
                ? parseModuleLoaders(composerSolverConfig.modules, chainId)
                : [],
        ingests: ingests,
        conditionBase: conditionBase,
    }
}

export function parseModuleLoaders(
    modules: ComposerModuleModel[],
    chainId: number
) {
    try {
        const parsedModuleLoaders = modules.map((module) => {
            const types = module.dataInputs?.map((x) => x.type) || []
            const values =
                module.dataInputs?.map((x, i) => {
                    if (types[i] === SolidityDataTypes.Bytes32) {
                        return ethers.utils.formatBytes32String(x.value)
                    } else {
                        return x.value
                    }
                }) || []

            const moduleDeploymentAddress = ModuleRegistryAPI.module(module.key)
                .deployments[chainId]

            if (moduleDeploymentAddress) {
                return {
                    module: moduleDeploymentAddress,
                    data: ethers.utils.defaultAbiCoder.encode(
                        [...types],
                        [...values]
                    ),
                }
            } else {
                throw new Error('Module not supported on this chain')
            }
        })

        return parsedModuleLoaders
    } catch (e) {
        cpLogger.push(e)
        return []
    }
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

            let dataToAdd = inSlot.data[0]
            if (inSlot.reference) {
                const currentSolver = sortedSolvers.find(
                    (x) => x.id === inSlot.reference?.solverId
                )
                if (currentSolver) {
                    if (inSlot.reference.slotId === 'keeper') {
                        dataToAdd = currentSolver.config.keeperAddress
                    } else if (inSlot.reference.slotId === 'arbitrator') {
                        dataToAdd = currentSolver.config.arbitratorAddress
                    } else {
                        throw 'Invalid reference. Constant slot reference can just be keeper or arbitrator'
                    }
                } else {
                    throw 'Invalid reference. Referenced Solver was not found.'
                }
            }

            outSlot.solverIndex = 0
            outSlot.data = ethers.utils.defaultAbiCoder.encode(
                [inSlot.dataTypes[0]],
                [dataToAdd]
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
    config: ComposerSolverConfigModel,
    currentSolverIndex: number,
    sortedSolvers: ComposerSolverModel[]
): ConditionModel {
    const outCondition = <ConditionModel>{}

    if (config.condition.outcomes.length < 2) {
        throw 'Condition must have at least two outcomes'
    }

    if (!config.condition.parentCollection && currentSolverIndex > 0) {
        throw 'Conditions of child Solvers must target a parentCollection'
    }

    if (
        config.condition.parentCollection &&
        config.condition.parentCollection.solverId &&
        config.condition.parentCollection.solverId !==
            sortedSolvers[currentSolverIndex - 1].id
    ) {
        throw 'parentCollectionIndex refers to a Solver which is not the immediate parent'
    }

    if (
        config.condition.parentCollection?.ocId &&
        config.condition.parentCollection.solverId &&
        !sortedSolvers[currentSolverIndex - 1].config.condition.partition.find(
            (oc) => oc.id === config.condition.parentCollection?.ocId
        )
    ) {
        throw 'parentCollectionId refers to an outcome collection which is out of scope'
    }

    if (
        !sortedSolvers[currentSolverIndex].config.slots[
            config.condition.amountSlot
        ]
    ) {
        throw 'amountSlot must refer to a slot on the current Solver'
    }

    if (config.condition.recipients.length < 1) {
        throw 'condition has no recipients'
    }

    if (
        config.condition.recipients.find(
            (slotPath) =>
                slotPath.solverId !== sortedSolvers[currentSolverIndex].id
        )
    ) {
        throw 'recipients must refer to slots on the current solver'
    }

    if (
        Object.keys(config.condition.recipientAmountSlots).find((key) =>
            config.condition.recipientAmountSlots[key].find(
                (recipientAmountPath) =>
                    recipientAmountPath.amount.solverId !==
                    sortedSolvers[currentSolverIndex].id
            )
        )
    ) {
        throw 'recipientAmounts must refer to slots on the current solver'
    }

    if (!config.collateralToken) {
        throw 'no collateral token in config'
    }

    outCondition.collateralToken = config.collateralToken
    outCondition.outcomeSlots = filterOutcomes(
        config.condition.partition
    ).length

    const parentSolver = sortedSolvers.find(
        (x) => x.id === config.condition.parentCollection?.solverId
    )

    const parentOC = parentSolver?.config.condition.partition.find(
        (oc) => oc.id === config.condition.parentCollection?.ocId
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

    outCondition.partition = parsePartition(config.condition.partition)
    outCondition.amountSlot = ethers.utils.formatBytes32String(
        config.condition.amountSlot
    )

    outCondition.allocations = [] as AllocationPathsType[]

    config.condition.recipients.forEach((slotPath, i) => {
        outCondition.allocations.push(<AllocationPathsType>{
            recipientAddressSlot: ethers.utils.formatBytes32String(
                slotPath.slotId
            ),
            recipientAmountSlots: outCondition.partition.map((indexSet, j) => {
                const ocId = config.condition.partition.find(
                    (oc) =>
                        indexSet ===
                        getIndexSetFromBinaryArray(
                            getBinaryArrayFromOC(oc, config.condition.partition)
                        )
                )?.id
                if (ocId) {
                    const amountSlotId = config.condition.recipientAmountSlots[
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

    outCondition.outcomeURIs = filterOutcomes(config.condition.partition).map(
        (o) => o.uri
    )

    return outCondition
}

// Filter out existant outcomes which are not in an outcomeCollection
export function filterOutcomes(
    outcomeCollections: ComposerOutcomeCollectionModel[]
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
    outcomeCollections: ComposerOutcomeCollectionModel[]
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
    OC: ComposerOutcomeCollectionModel,
    outcomeCollections: ComposerOutcomeCollectionModel[]
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
