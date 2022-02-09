export type Tag = {
    text: string
    elementId: string // <slotId> | data | keeper | arbitrator | timelock | collateralToken
    isAwaitingInput: boolean
}

export type SolverMetadata = {
    id: string
    chainIndex: number
    title: string
    description: string
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
