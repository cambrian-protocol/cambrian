import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { ProposalModel } from '@cambrian/app/models/ProposalModel'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'

export enum StageNames {
    composition = 'composition',
    template = 'template',
    proposal = 'proposal',
}

export type StageModel = CompositionModel | TemplateModel | ProposalModel

export type Stages = {
    [key in StageNames]: StageModel
}
