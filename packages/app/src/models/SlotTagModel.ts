import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'

export type SlotTagsHashMapType = {
    [elementId: string]: SlotTagModel
}

export type SlotTagModel = {
    id: string
    dataTypes: SolidityDataTypes[]
    isFlex?: boolean
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
