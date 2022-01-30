import { Box, Text } from 'grommet'
import { SlotModel, SlotTypes } from '@cambrian/app/models/SlotModel'

import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { WarningCircle } from 'phosphor-react'
import { BytesLike, ethers } from 'ethers'

/**
 * Determites if the passed parameter is a Slot
 * @returns true if it is a slot
 * */
export function isSlot(
    toBeDetermined: any | SlotModel
): toBeDetermined is SlotModel {
    if ((toBeDetermined as SlotModel).slotType) {
        return true
    }
    return false
}

export const getSlotsByDatatype = (
    dataType: SolidityDataTypes,
    solver: SolverModel
): SlotModel[] => {
    const slots: SlotModel[] = []

    for (const [_, value] of Object.entries(solver.config.slots)) {
        switch (value.slotType) {
            case SlotTypes.Constant:
                if (
                    value.dataTypes.length === 1 &&
                    value.dataTypes[0] == dataType
                ) {
                    slots.push(value)
                }
            case SlotTypes.Function:
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
    solvers: SolverModel[]
) => {
    const slots: SlotModel[] = []

    solvers.forEach((solver) => {
        for (const [_, value] of Object.entries(solver.config.slots)) {
            switch (value.slotType) {
                case SlotTypes.Constant:
                    if (
                        value.dataTypes.length === 1 &&
                        value.dataTypes[0] == dataType
                    ) {
                        slots.push(value)
                    }
                case SlotTypes.Function:
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
    slotModel: SlotModel,
    solvers: SolverModel[]
): string | JSX.Element => {
    if (solvers) {
        if (slotModel.targetSolverId !== undefined) {
            // Its either a callback or a function
            if (slotModel.slotType === SlotTypes.Callback) {
                const callingSolver = solvers.find(
                    (x) => x.id === slotModel.targetSolverId
                )
                if (callingSolver) {
                    const callingSlot =
                        callingSolver.config.slots[slotModel.data[0]]

                    if (callingSlot) {
                        if (
                            callingSlot.description &&
                            callingSlot.description !== ''
                        ) {
                            return `${callingSlot.description} (${callingSolver.title})`
                        } else if (callingSlot.data.length === 1) {
                            return `${callingSlot.data[0].toString()} (${
                                callingSolver.title
                            })`
                        }
                    }
                }
            } else if (
                slotModel.slotType === SlotTypes.Function &&
                slotModel.solverFunction?.name === 'addressFromChainIndex'
            ) {
                // Get solver title
                return (
                    solvers.find((x) => x.id === slotModel.targetSolverId)
                        ?.title || 'No Solver title found'
                )
            }
        } else if (
            slotModel.slotType === SlotTypes.Constant ||
            slotModel.slotType === SlotTypes.Manual
        ) {
            // Display if its an Arbitrator or Keeper
            if (slotModel.solverConfigAddress !== undefined) {
                const configSolver = solvers.find(
                    (x) => x.id === slotModel.solverConfigAddress?.solverId
                )
                return `${configSolver?.title}'s ${slotModel.solverConfigAddress.type}`
            }

            // Get constant desc or first data entry
            if (
                slotModel.description &&
                slotModel.description !== undefined &&
                slotModel.description !== ''
            ) {
                return slotModel.description
            } else if (slotModel.data.length === 1) {
                return slotModel.data[0].toString()
            }
        }
    }
    return (
        <Box direction="row" gap="xsmall" align="center">
            <WarningCircle color="red" size={'24'} />
            <Text size="small" color="status-error" weight={'normal'}>
                Missing data
            </Text>
        </Box>
    )
}
