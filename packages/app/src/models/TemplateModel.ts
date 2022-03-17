import { CompositionModel } from '@cambrian/app/models/CompositionModel'

export type TemplateModel = {
    pfp?: string
    name?: string
    title: string
    description: string
    updatedComposition: CompositionModel
    price?: {
        amount: number
        denominationToken: string
        preferredTokens?: 'any' | string[]
    }
}
