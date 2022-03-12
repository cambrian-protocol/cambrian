import { ComposerSolverModel } from '@cambrian/app/models/SolverModel'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { FlexInputs } from '@cambrian/app/models/SlotTagModel'

export const mergeFlexIntoComposition = (
    oldComposition: CompositionModel,
    flexInputs: FlexInputs
): CompositionModel => {
    const updatedComposerSolvers = [...oldComposition.solvers]

    // Update our composition with new flexInput values
    if (Object.entries(flexInputs).length > 0) {
        updatedComposerSolvers.forEach(
            (solver: ComposerSolverModel, i: number) => {
                for (const [tagId, taggedInput] of Object.entries(
                    flexInputs[solver.id]
                )) {
                    console.log(tagId, taggedInput)
                    updatedComposerSolvers[i].slotTags[tagId] = {
                        id: taggedInput.id,
                        label: taggedInput.label,
                        description: taggedInput.description,
                        isFlex: taggedInput.isFlex,
                    }

                    if (typeof taggedInput.value !== 'undefined') {
                        switch (tagId) {
                            case 'keeper':
                                updatedComposerSolvers[i].config[
                                    'keeperAddress'
                                ].address = taggedInput.value
                                break

                            case 'arbitrator':
                                updatedComposerSolvers[i].config[
                                    'arbitratorAddress'
                                ].address = taggedInput.value
                                break

                            case 'data':
                                updatedComposerSolvers[i].config['data'] =
                                    taggedInput.value
                                break

                            case 'collateralToken':
                                updatedComposerSolvers[i].config[
                                    'collateralToken'
                                ] = taggedInput.value
                                break

                            case 'timelockSeconds':
                                updatedComposerSolvers[i].config[
                                    'timelockSeconds'
                                ] = parseInt(taggedInput.value)
                                break

                            default:
                                // SlotID
                                updatedComposerSolvers[i].config.slots[
                                    tagId
                                ].data = [taggedInput.value]
                        }
                    }
                }
            }
        )
    }

    return {
        ...oldComposition,
        solvers: updatedComposerSolvers,
    }
}
