import { SlotTagModel } from '@cambrian/app/models/SlotTagModel'
import SlotTag from './SlotTag'

export class CollateralTokenTag extends SlotTag {
    constructor(tagObj: SlotTagModel) {
        if (tagObj.slotId !== 'collateralToken') {
            throw new Error(
                `Tried to create ArbitratorTag for slotId ${tagObj.slotId}`
            )
        }
        tagObj.label = 'Collateral Token'
        super(tagObj)
    }

    public override get description() {
        return this._description?.length > 0
            ? this._description
            : 'The token to be used as payment. Beneficiaries may claim their funds after an outcome is reported.'
    }

    public override get instruction() {
        return this._instruction?.length > 0
            ? this._instruction
            : 'Input or select the token to be used as payment for this Solver.'
    }
}
