import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { ProposalModel } from '@cambrian/app/models/ProposalModel'
import { StringHashmap } from '@cambrian/app/models/UtilityModels'
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

export type BaseStagesLibType = {
    lib: StringHashmap
    archive: { lib: StringHashmap }
}
export type TemplateStagesLibType = BaseStagesLibType & {
    archive: { receivedProposals: StringHashmap }
}

export type CambrianStagesLibType = {
    recents: string[]
    proposals: BaseStagesLibType
    templates: TemplateStagesLibType
    compositions: BaseStagesLibType
}
