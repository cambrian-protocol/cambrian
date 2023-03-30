import { IStageStack } from '../classes/stages/Proposal'
import { SlotTagsHashMapType } from '@cambrian/app/src/classes/Tags/SlotTag'
import { SolverTagModel } from '@cambrian/app/models/SolverTagModel'

export type SolverMetadataModel = {
    slotTags: SlotTagsHashMapType
    solverTag: SolverTagModel
    stageStack?: IStageStack
}
