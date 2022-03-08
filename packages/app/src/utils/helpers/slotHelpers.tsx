import { Box, Text } from 'grommet'

import { ComposerSlotModel } from '@cambrian/app/models/SlotModel'
import { ComposerSolverModel } from '@cambrian/app/models/SolverModel'
import { SlotTagsHashMapType } from '@cambrian/app/models/SlotTagModel'
import { SlotType } from '@cambrian/app/models/SlotType'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import { WarningCircle } from 'phosphor-react'

/**
 * Determites if the passed parameter is a Slot
 * @returns true if it is a slot
 * */
export function isSlot(
    toBeDetermined: any | ComposerSlotModel
): toBeDetermined is ComposerSlotModel {
    if ((toBeDetermined as ComposerSlotModel).slotType) {
        return true
    }
    return false
}

export const getSlotsByDatatype = (
    dataType: SolidityDataTypes,
    solver: ComposerSolverModel
): ComposerSlotModel[] => {
    const slots: ComposerSlotModel[] = []

    for (const [_, value] of Object.entries(solver.config.slots)) {
        switch (value.slotType) {
            case SlotType.Constant:
                if (
                    value.dataTypes.length === 1 &&
                    value.dataTypes[0] == dataType
                ) {
                    slots.push(value)
                }
            case SlotType.Function:
                if (
                    value.solverFunction?.outputs?.length === 1 &&
                    value.solverFunction.outputs[0].type === dataType
                ) {
                    slots.push(value)
                }
        }
    }

    return slots
}

// TODO create one function with optional solverindex parameter, if provided, then just return slots from this solver
export const getAllSlotsByDataType = (
    dataType: SolidityDataTypes,
    solvers: ComposerSolverModel[]
) => {
    const slots: ComposerSlotModel[] = []

    solvers.forEach((solver) => {
        for (const [_, value] of Object.entries(solver.config.slots)) {
            switch (value.slotType) {
                case SlotType.Constant:
                    if (
                        value.dataTypes.length === 1 &&
                        value.dataTypes[0] == dataType
                    ) {
                        slots.push(value)
                    }
                case SlotType.Function:
                    if (
                        value.solverFunction?.outputs?.length === 1 &&
                        value.solverFunction.outputs[0].type === dataType
                    ) {
                        slots.push(value)
                    }
            }
        }
    })

    return slots
}

/***
 * Returns the title of the passed SlotModel.
 *
 *  */
export const getSlotTitle = (
    slotModel: ComposerSlotModel,
    currentSolverTags: SlotTagsHashMapType,
    solvers: ComposerSolverModel[]
): string | JSX.Element => {
    if (solvers) {
        if (slotModel.targetSolverId !== undefined) {
            // Its either a callback or a function
            if (slotModel.slotType === SlotType.Callback) {
                const callingSolver = solvers.find(
                    (x) => x.id === slotModel.targetSolverId
                )
                if (callingSolver) {
                    const callingSlot =
                        callingSolver.config.slots[slotModel.data[0]]
                    if (callingSlot) {
                        const callingSlotTag =
                            callingSolver.slotTags[callingSlot.id]
                        if (callingSlotTag && callingSlotTag.label !== '') {
                            return `${callingSlotTag.label} (${callingSolver.title})`
                        } else if (callingSlot.data.length === 1) {
                            return `${callingSlot.data[0].toString()} (${
                                callingSolver.title
                            })`
                        }
                    }
                }
            } else if (
                slotModel.slotType === SlotType.Function &&
                slotModel.solverFunction?.name === 'addressFromChainIndex'
            ) {
                // Get solver title
                return (
                    solvers.find((x) => x.id === slotModel.targetSolverId)
                        ?.title || 'No Solver title found'
                )
            }
        } else if (
            slotModel.slotType === SlotType.Constant ||
            slotModel.slotType === SlotType.Manual
        ) {
            // Display if its an Arbitrator or Keeper
            if (slotModel.solverConfigAddress !== undefined) {
                const configSolver = solvers.find(
                    (x) => x.id === slotModel.solverConfigAddress?.solverId
                )
                return `${configSolver?.title}'s ${slotModel.solverConfigAddress.type}`
            }
            const currentSlotTag = currentSolverTags[slotModel.id]
            // Get constant desc or first data entry
            if (currentSlotTag && currentSlotTag.label !== '') {
                return currentSlotTag.label
            } else if (slotModel.data.length === 1) {
                return slotModel.data[0].toString()
            }
        }
    }
    return (
        <Box direction="row" gap="xsmall" align="center">
            <WarningCircle color="red" size={'24'} />
            <Text size="small" color="status-error" weight={'normal'}>
                No label found
            </Text>
        </Box>
    )
}
