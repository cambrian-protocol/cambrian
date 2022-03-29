import { Box, Text } from 'grommet'
import {
    ComposerAllocationPathsType,
    RecipientAllocationModel,
} from '@cambrian/app/models/AllocationModel'
import {
    ComposerSlotModel,
    ComposerSlotPathType,
    SlotModel,
} from '@cambrian/app/models/SlotModel'

import { ComposerSolverModel } from '@cambrian/app/models/SolverModel'
import { ParticipantModel } from '@cambrian/app/models/ParticipantModel'
import { SlotTagsHashMapType } from '@cambrian/app/models/SlotTagModel'
import { SlotType } from '@cambrian/app/models/SlotType'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import { WarningCircle } from 'phosphor-react'
import { parseComposerSlot } from '../transformers/ComposerTransformer'

/**
 * Determites if the passed parameter is a Slot
 * @returns true if it is a slot
 * */
export function isComposerSlot(
    toBeDetermined?: any | ComposerSlotModel
): toBeDetermined is ComposerSlotModel {
    if (!toBeDetermined) return false
    if (
        (toBeDetermined as ComposerSlotModel).slotType &&
        (toBeDetermined as ComposerSlotModel).id
    ) {
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
    currentSlotTags: SlotTagsHashMapType,
    solvers: ComposerSolverModel[]
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

// TODO refactor
export const getReferenceData = (
    reference: ComposerSlotPathType,
    solvers: ComposerSolverModel[]
): string | undefined => {
    const referencedSolver = solvers.find((x) => x.id === reference.solverId)
    if (referencedSolver) {
        if (reference.slotId === 'keeper') {
            return referencedSolver.config.keeperAddress
        } else if (reference.slotId === 'arbitrator') {
            return referencedSolver.config.arbitratorAddress
        } else {
            const referencedSlot =
                referencedSolver.config.slots[reference.slotId]
            if (referencedSlot) {
                if (referencedSlot.reference) {
                    getReferenceData(referencedSlot.reference, solvers)
                } else if (referencedSlot.data.length === 1) {
                    return referencedSlot.data[0].toString()
                } else {
                    console.error('Error while displaying referenced data.')
                }
            } else {
                console.error('Could not find referenced slot.')
            }
        }
    } else {
        console.error('Could not find referenced solver.')
    }
}

// TODO refactor
export const getRecipientData = (
    recipientSlot: ComposerSlotModel | SlotModel,
    currentSolver: ComposerSolverModel,
    solvers: ComposerSolverModel[]
): ParticipantModel => {
    const slotTag = currentSolver.slotTags[recipientSlot.id]
    if (isComposerSlot(recipientSlot)) {
        let address = 'No address defined yet'

        if (recipientSlot.reference) {
            const referenceAddress = getReferenceData(
                recipientSlot.reference,
                solvers
            )
            if (referenceAddress) {
                address = referenceAddress
            }
        } else if (
            recipientSlot.data.length === 1 &&
            recipientSlot.data[0] !== ''
        ) {
            address = recipientSlot.data[0]
        }

        return {
            address: address,
            name: slotTag.label || 'No name defined',
            description: slotTag?.description,
        }
    } else {
        return {
            address: recipientSlot.data,
            name: slotTag.label || 'No name defined',
            description: slotTag?.description,
        }
    }
}

export const getRecipientAllocations = (
    recipientAmountSlots: ComposerAllocationPathsType[],
    currentSolver: ComposerSolverModel,
    solvers: ComposerSolverModel[]
): RecipientAllocationModel[] => {
    return recipientAmountSlots.map((allocation) => {
        return {
            addressSlot: {
                slot: parseComposerSlot(
                    currentSolver.config.slots[allocation.recipient.slotId],
                    solvers
                ),
                tag: currentSolver.slotTags[allocation.recipient.slotId],
            },
            amountPercentage: (
                currentSolver.config.slots[allocation.amount.slotId].data[0] /
                100
            ).toString(),
        }
    })
}
