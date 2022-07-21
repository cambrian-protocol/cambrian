import { ProposalStackType } from '../store/ProposalContext'
import { SlotTagsHashMapType } from '@cambrian/app/models/SlotTagModel'
import { SolverTagModel } from '@cambrian/app/models/SolverTagModel'

export type MetadataModel = {
    slotTags: SlotTagsHashMapType
    solverTag: SolverTagModel
    proposalStack?: ProposalStackType
}
