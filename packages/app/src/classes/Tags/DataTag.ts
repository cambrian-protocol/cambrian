import { SlotTagModel } from '@cambrian/app/models/SlotTagModel'
import ComposerSolver from '../ComposerSolver'
import SlotTag from './SlotTag'

export class DataTag extends SlotTag {
    constructor(solver: string | ComposerSolver, tagObj: SlotTagModel) {
        if (tagObj.slotId !== 'data') {
            throw new Error(
                `Tried to create DataTag for slotId ${tagObj.slotId}`
            )
        }
        tagObj.label = 'Data'
        super(solver, tagObj)
    }

    public override get description() {
        return this._description.length > 0
            ? this._description
            : 'Some Solvers require special data to function.'
    }

    public override get instruction() {
        return this._instruction.length > 0
            ? this._instruction
            : 'Find the documentation for this Solver.'
    }
}
