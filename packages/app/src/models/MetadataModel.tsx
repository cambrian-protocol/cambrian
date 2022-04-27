import { SlotTagsHashMapType } from '@cambrian/app/models/SlotTagModel'
import { SolverTagModel } from '@cambrian/app/models/SolverTagModel'
import { Stages } from '../classes/Stagehand'

export type MetadataModel = {
    slotTags: SlotTagsHashMapType
    solverTag: SolverTagModel
    stages?: Stages
}
