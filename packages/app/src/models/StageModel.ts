import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { ProposalModel } from '@cambrian/app/models/ProposalModel'
import { StringHashmap } from '@cambrian/app/models/UtilityModels'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'

export enum StageNames {
    composition = 'composition',
    template = 'template',
    proposal = 'proposal',
}

export type StageLibType = {
    lib: StringHashmap
    archive: { lib: string[] }
    recents: string[]
}

export type StageModel = CompositionModel | TemplateModel | ProposalModel

export type Stages = {
    [key in StageNames]: StageModel
}
