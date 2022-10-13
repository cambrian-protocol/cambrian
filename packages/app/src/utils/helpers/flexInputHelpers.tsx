import ComposerSolver from '@cambrian/app/classes/ComposerSolver'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import { TaggedInput } from '@cambrian/app/models/SlotTagModel'

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
