import { RichSlotModel, SlotModel } from '@cambrian/app/models/SlotModel'

import { GenericMethods } from './Solver'
import { SlotTagsHashMapType } from '@cambrian/app/models/SlotTagModel'
import { SlotType } from '@cambrian/app/models/SlotType'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { ethers } from 'ethers'

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

export const getManualInputs = (
    solverData: SolverModel,
    condition: SolverContractCondition
): RichSlotModel[] =>
    Object.values(solverData.slotsHistory[condition.conditionId]).filter(
        (slot) => slot.slot.ingestType === SlotType.Manual
    )

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
