import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import { SlotTagModel } from '../../models/SlotTagModel'
import ComposerSolver from '../ComposerSolver'

export default class SlotTag {
    _solverId: string
    _slotId = ''
    _isFlex: 'None' | 'Both' | 'Template' | 'Proposal' = 'None'
    _label = ''
    _description = ''
    _instruction = ''

    constructor(solver: string | ComposerSolver, tagObj: SlotTagModel) {
        this._solverId = typeof solver === 'string' ? solver : solver.id
        this.update(tagObj)
    }

    public get solverId() {
        return this._solverId
    }

    public get slotId() {
        return this._slotId
    }

    public get isFlex() {
        // @ts-ignore
        if (this._isFlex === true) {
            return 'Both'
            // @ts-ignore
        } else if (this._isFlex === false) {
            return 'None'
        } else {
            return this._isFlex
        }
    }

    public get label() {
        return this._label.trim() !== '' ? this._label : 'Unknown'
    }

    public get description() {
        return this._description
    }

    public get instruction() {
        return this._instruction
    }

    public get metadata() {
        return {
            slotId: this._slotId,
            isFlex: this._isFlex,
            label: this._label,
            description: this._description,
            instruction: this._instruction,
        }
    }

    public update(tagObj: SlotTagModel) {
        this._slotId = tagObj.slotId
        this._isFlex = tagObj.isFlex
        this._label = tagObj.label
        this._description = tagObj.description
        this._instruction = tagObj.instruction
    }
}
