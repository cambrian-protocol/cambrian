import { SolverModel } from './SolverModel'

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
