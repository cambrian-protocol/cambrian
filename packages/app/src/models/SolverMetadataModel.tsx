import { SlotTagsHashMapType } from '@cambrian/app/src/classes/Tags/SlotTag'
import { SolverTagModel } from '@cambrian/app/models/SolverTagModel'
import { StageStackType } from '../ui/dashboard/ProposalsDashboardUI'

export type SolverMetadataModel = {
    slotTags: SlotTagsHashMapType
    solverTag: SolverTagModel
    stageStack?: StageStackType
}
