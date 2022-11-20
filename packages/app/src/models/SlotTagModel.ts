import SlotTag from '../classes/Tags/SlotTag'

export type SlotTagsHashMapType = {
    [slotId: string]: SlotTag
}

// TODO Add icon
export type SlotTagModel = {
    solverId: string
    slotId: string
    isFlex: 'None' | 'Both' | 'Template' | 'Proposal'
    label: string
    description: string
    instruction: string
}

export type TaggedInput = SlotTagModel & {
    value: string
}

export type FlexInputs = {
    [solverId: string]: {
        [tagId: string]: TaggedInput
    }
}
