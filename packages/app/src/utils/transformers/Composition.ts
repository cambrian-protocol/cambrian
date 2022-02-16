import { SolverModel } from '@cambrian/app/models/SolverModel'
import { FlexInputs } from '@cambrian/app/models/TagModel'

export const mergeFlexIntoComposition = (
    oldComposition: SolverModel[],
    flexInputs: FlexInputs
): SolverModel[] => {
    const newComposition = oldComposition.map((x) => x)
    newComposition.forEach((solver: SolverModel, i: number) => {
        for (const [tagId, taggedInput] of Object.entries(
            flexInputs[solver.id]
        )) {
            newComposition[i].tags[tagId] = {
                id: taggedInput.id,
                text: taggedInput.text,
                isFlex: taggedInput.isFlex,
            }

            if (typeof taggedInput.value !== 'undefined') {
                switch (tagId) {
                    case 'keeper':
                        newComposition[i].config['keeperAddress'].address =
                            taggedInput.value
                        break

                    case 'arbitrator':
                        newComposition[i].config['arbitratorAddress'].address =
                            taggedInput.value
                        break

                    case 'data':
                        newComposition[i].config['data'] = taggedInput.value
                        break

                    case 'collateralToken':
                        newComposition[i].config['collateralToken'] =
                            taggedInput.value
                        break

                    case 'timelockSeconds':
                        newComposition[i].config['collateralToken'] =
                            taggedInput.value
                        break

                    default:
                        // SlotID
                        newComposition[i].config.slots[tagId].data = [
                            taggedInput.value,
                        ]
                }
            }
        }
    })

    return newComposition
}
