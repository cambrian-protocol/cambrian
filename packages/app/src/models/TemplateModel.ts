import { ComposerSolverModel } from './SolverModel'

export type TemplateModel = {
    pfp: string
    name: string
    title: string
    description: string
    composerSolvers: ComposerSolverModel[]
    price?: {
        amount: number
        denominationToken: string
        preferredTokens?: 'any' | string[]
    }
}
