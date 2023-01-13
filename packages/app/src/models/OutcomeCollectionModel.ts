import { AllocationModel } from './AllocationModel'
import { OutcomeModel } from './OutcomeModel'

export type OutcomeCollectionModel = {
    indexSet?: number
    outcomes: OutcomeModel[]
    allocations: AllocationModel[]
}

export type OutcomeCollectionsHashMapType = {
    [conditionId: string]: OutcomeCollectionModel[]
}

/* Composer explicit Types */

export type ComposerOutcomeCollectionModel = {
    id: string
    outcomes: OutcomeModel[]
}
