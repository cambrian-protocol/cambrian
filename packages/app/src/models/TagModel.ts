export type Tags = {
    [elementId: string]: Tag
}

export type Tag = {
    id: string
    text: string
    isAwaitingInput: boolean
}
