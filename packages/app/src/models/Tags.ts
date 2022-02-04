export type TaggedInput = {
    tagId: string
    inputType: 'text' | 'textbox' | 'number' | 'address'
}

export type Tag = {
    id: string
    elementId: string
    elementType: 'slot' | 'recipient' | 'solver'
    icon: any
    text: string
    isLocked: boolean
}

export type SolutionMetadata = {
    solvers: SolverMetadata[]
    strategy: StrategyMetadata[]
    template: TemplateMetadata[]
    proposal: ProposalMetadata[]
    tags: Tag[]
}

export type StrategyMetadata = {
    id: string
    title: string
    description: string
    avatar: string
    banner: string
}

export type SolverMetadata = {
    id: string
    title: string
    description: string
    avatar: string
    banner: string
    templateRequiredInputs: string[] // Tag IDs
}

export type TemplateMetadata = {
    id: string
    title: string
    description: string
    avatar: string
    banner: string
    proposerRequiredInputs: [] // Tag IDs
}

export type ProposalMetadata = {
    id: string
    title: string
    description: string
    proposerSuppliedInputs: [] // Tag IDs
}

// Template inputs to SolverConfigs

// Add ProposerInputs to SolverConfigs
