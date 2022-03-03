export type Tags = {
    [elementId: string]: TagModel
}

export type TagModel = {
    id: string
    text: string
    isFlex?: boolean
}

export type TaggedInput = TagModel & {
    value: string | undefined
}

export type FlexInputs = {
    [solverId: string]: {
        [tagId: string]: TaggedInput
    }
}
