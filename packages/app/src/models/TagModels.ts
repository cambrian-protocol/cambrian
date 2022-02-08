export type Tag = {
    id: string
    text: string
    elementId: string // ElementId | Data | Job Description | Keeper | Arbitrator
    isAwaitingInput: boolean
}

export type SolverMetadata = {
    id: string
    title: string
    description: string
    avatar: string
    banner: string
    tags: Tag[]
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

export type TemplateMetadata = {
    id: string
    title: string
    description: string
    avatar: string
    banner: string
}

export type ProposalMetadata = {
    id: string
    title: string
    description: string
    proposerSuppliedInputs: [] // Tag IDs
}

// Template inputs to SolverConfigs

// Add ProposerInputs to SolverConfigs
