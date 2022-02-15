export type Tags = {
    [elementId: string]: Tag
}

export type Tag = {
    id: string
    text: string
    isFlex?: boolean
}

export type TaggedInput = Tag & {
    value: string | undefined
}

export type FlexInputs = {
    [solverId: string]: {
        [tagId: string]: TaggedInput
    }
}
