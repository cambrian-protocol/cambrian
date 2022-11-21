import { SlotTagModel } from '@cambrian/app/models/SlotTagModel'
import SlotTag from './SlotTag'

export class KeeperTag extends SlotTag {
    constructor(tagObj: SlotTagModel) {
        if (tagObj.slotId !== 'keeper') {
            throw new Error(
                `Tried to create KeeperTag for slotId ${tagObj.slotId}`
            )
        }
        tagObj.label = 'Keeper'
        super(tagObj)
    }

    public override get description() {
        return this._description?.length > 0
            ? this._description
            : 'The Keeper reports outcomes and manages the Solver.'
    }

    public override get instruction() {
        return this._instruction?.length > 0
            ? this._instruction
            : 'Input the account or smart contract address which will manage this Solver.'
    }
}
