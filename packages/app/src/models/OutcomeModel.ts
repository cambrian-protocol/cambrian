export type OutcomeModel = {
    id: string
    title: string
    uri: string
    description: string
    context: string
}

export type OutcomeCollectionModel = {
    id: string
    outcomes: OutcomeModel[]
}
