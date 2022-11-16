import ComposerSolver from '@cambrian/app/classes/ComposerSolver'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { DEFAULT_SLOT_TAGS } from '@cambrian/app/constants/DefaultSlotTags'
import { FlexInputFormType } from '@cambrian/app/ui/templates/forms/TemplateFlexInputsForm'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import { TaggedInput } from '@cambrian/app/models/SlotTagModel'
import _ from 'lodash'

export const getFlexInputType = (
    solvers: ComposerSolver[],
    tag: TaggedInput
) => {
    if (tag.id === 'data') {
        return 'string'
    } else if (
        tag.id === 'keeper' ||
        tag.id === 'arbitrator' ||
        tag.id === 'collateralToken'
    ) {
        return 'address'
    } else if (tag.id === 'timelockSeconds') {
        return 'number'
    } else {
        // Slot ID
        const slot = solvers.find((solver) => solver.config.slots[tag.id])
            ?.config.slots[tag.id]
        if (slot?.dataTypes[0] === SolidityDataTypes.Uint256) {
            return 'number'
        } else if (slot?.dataTypes[0] === SolidityDataTypes.Address) {
            return 'address'
        } else {
            return 'string'
        }
    }
}

export const getFlexInputLabel = (flexInput: FlexInputFormType) => {
    const label =
        flexInput.label.trim() !== ''
            ? flexInput.label
            : DEFAULT_SLOT_TAGS[flexInput.id]
            ? DEFAULT_SLOT_TAGS[flexInput.id].label
            : 'Unknown'
    return label
}

export const getFlexInputDescription = (flexInput: FlexInputFormType) => {
    const label =
        flexInput.description.trim() !== ''
            ? flexInput.description
            : DEFAULT_SLOT_TAGS[flexInput.id]
            ? DEFAULT_SLOT_TAGS[flexInput.id].description
            : undefined
    return label
}

export const getFlexInputInstruction = (flexInput: FlexInputFormType) => {
    console.log(flexInput)
    const label =
        flexInput.instruction && flexInput.instruction.trim() !== ''
            ? flexInput.instruction
            : DEFAULT_SLOT_TAGS[flexInput.id]
            ? DEFAULT_SLOT_TAGS[flexInput.id].instruction
            : undefined
    return label
}

export const mergeFlexIntoComposition = (
    oldComposition: CompositionModel,
    flexInputs: FlexInputFormType[]
): CompositionModel => {
    const updatedComposerSolvers = _.cloneDeep(oldComposition.solvers)

    // Update our composition with new flexInput values
    if (flexInputs.length > 0) {
        updatedComposerSolvers.forEach((solver: ComposerSolver, i: number) => {
            const filteredFlexInputs = flexInputs.filter(
                (flexInput) => flexInput.solverId === solver.id
            )
            filteredFlexInputs.forEach((filteredFlexInput) => {
                solver.slotTags[filteredFlexInput.tagId] = {
                    ...solver.slotTags[filteredFlexInput.tagId],
                    isFlex: filteredFlexInput.isFlex,
                }

                if (
                    typeof filteredFlexInput.value !== 'undefined' &&
                    filteredFlexInput.value !== ''
                ) {
                    switch (filteredFlexInput.tagId) {
                        case 'keeper':
                            solver.slotTags['keeper'] = {
                                ...solver.slotTags['keeper'],
                                isFlex: false,
                            }
                            solver.config['keeperAddress'] =
                                filteredFlexInput.value
                            break

                        case 'arbitrator':
                            solver.slotTags['arbitrator'] = {
                                ...solver.slotTags['arbitrator'],
                                isFlex: false,
                            }
                            solver.config['arbitratorAddress'] =
                                filteredFlexInput.value
                            break

                        // case 'data':
                        //     updatedComposerSolvers[i].config['data'] =
                        //         taggedInput.value
                        //     break

                        /*   case 'collateralToken':
                                solver.config['collateralToken'] =
                                    filteredFlexInput.value
                                break */

                        case 'timelockSeconds':
                            solver.slotTags['timelockSeconds'] = {
                                ...solver.slotTags['timelockSeconds'],
                                isFlex: false,
                            }
                            solver.config['timelockSeconds'] = parseInt(
                                filteredFlexInput.value
                            )
                            break

                        default:
                            solver.slotTags[filteredFlexInput.tagId] = {
                                ...solver.slotTags[filteredFlexInput.tagId],
                                isFlex: false,
                            }
                            // SlotID
                            solver.config.slots[filteredFlexInput.tagId].data =
                                [filteredFlexInput.value]
                    }
                }
            })
        })
    }

    return {
        ...oldComposition,
        solvers: updatedComposerSolvers,
    }
}
