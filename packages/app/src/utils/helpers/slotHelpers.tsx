import { Box, Text } from 'grommet'

import { ComposerSlotModel } from '@cambrian/app/models/SlotModel'
import ComposerSolver from '@cambrian/app/classes/ComposerSolver'
import { SlotTagsHashMapType } from '@cambrian/app/models/SlotTagModel'
import { SlotType } from '@cambrian/app/models/SlotType'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import { WarningCircle } from 'phosphor-react'

/**
 * Determites if the passed parameter is a Slot
 * @returns true if it is a slot
 * */
export function isSlot(
    toBeDetermined?: any | ComposerSlotModel
): toBeDetermined is ComposerSlotModel {
    if (!toBeDetermined) return false
    if ((toBeDetermined as ComposerSlotModel).slotType) {
        return true
    }
    return false
}

export const getSlotsByDatatype = (
    dataType: SolidityDataTypes,
    solver: ComposerSolver
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
    solvers: ComposerSolver[]
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
    currentSlotTags: SlotTagsHashMapType
): string | JSX.Element => {
    const currentSlotTag = currentSlotTags[slotModel.id]

    if (currentSlotTag && currentSlotTag.label !== '') {
        return currentSlotTag.label
    } else if (slotModel.data.length === 1 && slotModel.data[0] !== '') {
        return slotModel.data[0]
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
