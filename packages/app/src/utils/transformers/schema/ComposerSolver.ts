import { CompositionModel } from '@cambrian/app/models/CompositionModel'

/**
 * Start of some functions to update things from previous versions
 * for backwards compatibility. This first version makes changes to
 * ComposerSolver slots from <no schema> to <0.1>
 */

const updaters = [updateFromVersion0]

export function updateToSchema(
    schemaVer: number,
    composition: CompositionModel
) {
    if (!composition.schemaVer || composition.schemaVer < schemaVer) {
        composition = updaters[schemaVer - 1](composition)
    }

    return composition
}

/**
 * This update changes 'id' to 'slotId' in SlotTags
 */
export function updateFromVersion0(composition: CompositionModel) {
    composition.solvers.forEach((solver) => {
        Object.keys(solver.slotTags).forEach((id) => {
            solver.slotTags[id]['slotId'] = id
            delete solver.slotTags[id]['id']
        })
    })
    return composition
}
