import { SlotTagModel } from '@cambrian/app/src/classes/Tags/SlotTag'
import SlotTag from './SlotTag'

export default class TimelockSecondsTag extends SlotTag {
    constructor(tagObj: SlotTagModel) {
        if (tagObj.slotId !== 'timelockSeconds') {
            throw new Error(
                `Tried to create TimelockSecondsTag for slotId ${tagObj.slotId}`
            )
        }
        tagObj.label = 'Timelock'
        super(tagObj)
    }

    public override get description() {
        return this._description.length > 0
            ? this._description
            : 'Length of time before a proposed outcome can be confirmed. Participants may request arbitration if they disagree with a proposed outcome and an Arbitrator has been designated.'
    }

    public override get instruction() {
        return this._instruction?.length > 0
            ? this._instruction
            : 'Input the duration of time, in seconds, that must pass without an arbitration request before a proposed outcome can be confirmed.'
    }
}
