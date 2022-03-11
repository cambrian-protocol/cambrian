import ComposerSolver from '../classes/ComposerSolver'

export type TemplateModel = {
    pfp: string
    name: string
    title: string
    description: string
    composerSolvers: ComposerSolver[]
    price?: {
        amount: number
        denominationToken: string
        preferredTokens?: 'any' | string[]
    }
}
