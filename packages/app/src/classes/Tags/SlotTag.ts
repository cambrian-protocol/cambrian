import { SlotTagModel } from '../../models/SlotTagModel'

export const defaultSlotTagValues: SlotTagModel = {
    solverId: '',
    slotId: '',
    label: '',
    description: '',
    instruction: '',
    isFlex: 'None',
}
export default class SlotTag {
    protected _solverId = defaultSlotTagValues.solverId
    protected _slotId = defaultSlotTagValues.slotId
    protected _isFlex = defaultSlotTagValues.isFlex
    protected _label = defaultSlotTagValues.label
    protected _description = defaultSlotTagValues.description
    protected _instruction = defaultSlotTagValues.instruction

    constructor(slotTag: SlotTagModel) {
        this.update(slotTag)
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
            solverId: this.solverId,
            slotId: this.slotId,
            isFlex: this.isFlex,
            label: this.label,
            description: this.description,
            instruction: this.instruction,
        }
    }

    public update(slotTag: SlotTagModel) {
        if (Object.values(slotTag).find((v) => v === undefined)) {
            throw new Error(`Attempted to update slotTag with undefined value`)
        }
        this._solverId = slotTag.solverId
        this._slotId = slotTag.slotId
        this._isFlex = slotTag.isFlex
        this._label = slotTag.label
        this._description = slotTag.description
        this._instruction = slotTag.instruction
    }

    toJSON() {
        return this.metadata
    }
}
