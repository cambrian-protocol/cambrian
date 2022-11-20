import ComposerSolver from '@cambrian/app/classes/ComposerSolver'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { DEFAULT_SLOT_TAGS } from '@cambrian/app/constants/DefaultSlotTags'
import { FlexInputFormType } from '@cambrian/app/ui/templates/forms/TemplateFlexInputsForm'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import { TaggedInput } from '@cambrian/app/models/SlotTagModel'
import _ from 'lodash'
import { BASE_SOLVER_IFACE } from 'packages/app/config/ContractInterfaces'

export const getFlexInputType = (
    solvers: ComposerSolver[],
    tag: TaggedInput
) => {
    if (tag.slotId === 'data') {
        return 'string'
    } else if (
        tag.slotId === 'keeper' ||
        tag.slotId === 'arbitrator' ||
        tag.slotId === 'collateralToken'
    ) {
        return 'address'
    } else if (tag.slotId === 'timelockSeconds') {
        return 'number'
    } else {
        // Slot ID
        const slot = solvers.find((solver) => solver.config.slots[tag.slotId])
            ?.config.slots[tag.slotId]
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
            : DEFAULT_SLOT_TAGS[flexInput.slotId]
            ? DEFAULT_SLOT_TAGS[flexInput.slotId].label
            : 'Unknown'
    return label
}

export const getFlexInputDescription = (flexInput: FlexInputFormType) => {
    const label =
        flexInput.description.trim() !== ''
            ? flexInput.description
            : DEFAULT_SLOT_TAGS[flexInput.slotId]
            ? DEFAULT_SLOT_TAGS[flexInput.slotId].description
            : undefined
    return label
}

export const getFlexInputInstruction = (flexInput: FlexInputFormType) => {
    const label =
        flexInput.instruction && flexInput.instruction.trim() !== ''
            ? flexInput.instruction
            : DEFAULT_SLOT_TAGS[flexInput.slotId]
            ? DEFAULT_SLOT_TAGS[flexInput.slotId].instruction
            : undefined
    return label
}

export const mergeFlexIntoComposition = (
    composition: CompositionModel,
    flexInputs: FlexInputFormType[]
): CompositionModel => {
    // Update our composition with new flexInput values
    if (flexInputs.length > 0) {
        composition.solvers.forEach((solver: ComposerSolver, i: number) => {
            solver = new ComposerSolver(
                BASE_SOLVER_IFACE,
                solver.id,
                solver.config,
                solver.slotTags,
                solver.solverTag
            )
            const filteredFlexInputs = flexInputs.filter(
                (flexInput) => flexInput.solverId === solver.id
            )
            filteredFlexInputs.forEach((filteredFlexInput) => {
                console.log(solver.slotTags[filteredFlexInput.tagId])
                solver.slotTags[filteredFlexInput.tagId].update({
                    ...solver.slotTags[filteredFlexInput.tagId].metadata,
                    isFlex: filteredFlexInput.isFlex,
                })

                if (
                    typeof filteredFlexInput.value !== 'undefined' &&
                    filteredFlexInput.value !== ''
                ) {
                    switch (filteredFlexInput.tagId) {
                        case 'keeper':
                            solver.slotTags['keeper'].update({
                                ...solver.slotTags['keeper'].metadata,
                                isFlex: 'None',
                            })
                            solver.updateKeeper(filteredFlexInput.value)
                            break

                        case 'arbitrator':
                            solver.slotTags['arbitrator'].update({
                                ...solver.slotTags['arbitrator'].metadata,
                                isFlex: 'None',
                            })
                            solver.updateArbitrator(filteredFlexInput.value)
                            break

                        // case 'data':
                        //     composerSolvers[i].config['data'] =
                        //         taggedInput.value
                        //     break

                        /*   case 'collateralToken':
                                solver.config['collateralToken'] =
                                    filteredFlexInput.value
                                break */

                        case 'timelockSeconds':
                            solver.slotTags['timelockSeconds'].update({
                                ...solver.slotTags['timelockSeconds'].metadata,
                                isFlex: 'None',
                            })
                            solver.updateTimelock(
                                parseInt(filteredFlexInput.value)
                            )
                            break

                        default:
                            solver.slotTags[filteredFlexInput.tagId].update({
                                ...solver.slotTags[filteredFlexInput.tagId]
                                    .metadata,
                                isFlex: 'None',
                            })
                            // SlotID
                            solver.config.slots[filteredFlexInput.tagId].data =
                                [filteredFlexInput.value]
                    }
                }
            })
        })
    }

    return composition
}
