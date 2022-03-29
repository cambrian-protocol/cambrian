import { OutcomeModel } from './OutcomeModel'
import { RecipientAllocationModel } from './AllocationModel'

export type OutcomeCollectionModel = {
    indexSet: number
    outcomes: OutcomeModel[]
    allocations: RecipientAllocationModel[]
}

export type OutcomeCollectionsHashMapType = {
    [conditionId: string]: OutcomeCollectionModel[]
}
