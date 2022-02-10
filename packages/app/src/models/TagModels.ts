import { SolverModel } from './SolverModel'

export type Tags = {
    [elementId: string]: Tag
}

export type Tag = {
    id: string
    text: string
    isAwaitingInput: boolean
}

export type TemplateMetadata = {
    pfp: string
    name: string
    title: string
    description: string
    composition: SolverModel[]
}
