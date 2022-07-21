import { ComposerSolverModel } from '@cambrian/app/models/SolverModel'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { FlexInputFormType } from '@cambrian/app/ui/templates/forms/TemplateFlexInputsForm'
import _ from 'lodash'

export const mergeFlexIntoComposition = (
    oldComposition: CompositionModel,
    flexInputs: FlexInputFormType[]
): CompositionModel => {
    const updatedComposerSolvers = _.cloneDeep(oldComposition.solvers)

    // Update our composition with new flexInput values
    if (flexInputs.length > 0) {
        updatedComposerSolvers.forEach(
            (solver: ComposerSolverModel, i: number) => {
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
                                solver.config['keeperAddress'] =
                                    filteredFlexInput.value
                                break

                            case 'arbitrator':
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
                                solver.config['timelockSeconds'] = parseInt(
                                    filteredFlexInput.value
                                )
                                break

                            default:
                                // SlotID
                                solver.config.slots[
                                    filteredFlexInput.tagId
                                ].data = [filteredFlexInput.value]
                        }
                    }
                })
            }
        )
    }

    return {
        ...oldComposition,
        solvers: updatedComposerSolvers,
    }
}
