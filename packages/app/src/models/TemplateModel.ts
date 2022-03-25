import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { FlexInputs } from './SlotTagModel'

export type TemplateModel = {
    pfp?: string
    name?: string
    title: string
    description: string
    price?: {
        amount: number
        denominationToken: string
        preferredTokens?: 'any' | string[]
    }
    compositionCID: string
    flexInputs: FlexInputs
}
