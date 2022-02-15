import { SolverModel } from './SolverModel'
import { FlexInputs } from './TagModel'

export type TemplateModel = {
    pfp: string
    name: string
    title: string
    description: string
    composition: SolverModel[]
    price?: {
        amount: number
        denominationToken: string
        preferredTokens?: 'any' | string[]
    }
}
