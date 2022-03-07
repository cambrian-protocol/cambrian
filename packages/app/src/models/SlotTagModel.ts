import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'

export type SlotTagsHashMapType = {
    [elementId: string]: SlotTagModel
}

export type SlotTagModel = {
    id: string
    text: string
    dataType: SolidityDataTypes
    isFlex?: boolean
    description?: string
}

export type TaggedInput = SlotTagModel & {
    value: string | undefined
}

export type FlexInputs = {
    [solverId: string]: {
        [tagId: string]: TaggedInput
    }
}
