import { SlotTagsHashMapType } from '@cambrian/app/models/SlotTagModel'
import { SolverTagModel } from '@cambrian/app/models/SolverTagModel'
import { StageStackType } from '../ui/dashboard/ProposalsDashboardUI'

export type SolverMetadataModel = {
    slotTags: SlotTagsHashMapType
    solverTag: SolverTagModel
    stageStack?: StageStackType
}
