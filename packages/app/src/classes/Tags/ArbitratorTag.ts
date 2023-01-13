import { SlotTagModel } from '@cambrian/app/src/classes/Tags/SlotTag'
import SlotTag from './SlotTag'

export class ArbitratorTag extends SlotTag {
    constructor(tagObj: SlotTagModel) {
        if (tagObj.slotId !== 'arbitrator') {
            throw new Error(
                `Tried to create ArbitratorTag for slotId ${tagObj.slotId}`
            )
        }
        tagObj.label = 'Arbitrator'
        super(tagObj)
    }

    public override get description() {
        return this._description?.length > 0
            ? this._description
            : 'The Arbitrator may overrule a proposed outcome after a participant raises a dispute during the timelock.'
    }

    public override get instruction() {
        return this._instruction?.length > 0
            ? this._instruction
            : 'Input the account or smart contract address which will act as an arbitrator.'
    }
}
