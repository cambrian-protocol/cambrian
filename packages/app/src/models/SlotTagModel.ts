import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'

export type SlotTagsHashMapType = {
    [slotId: string]: SlotTagModel
}

// TODO Add icon
export type SlotTagModel = {
    id: string
    isFlex: boolean
    label: string
    description: string
}

export type TaggedInput = SlotTagModel & {
    value: string | undefined
}

export type FlexInputs = {
    [solverId: string]: {
        [tagId: string]: TaggedInput
    }
}
