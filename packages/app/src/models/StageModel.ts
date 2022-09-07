import { CeramicProposalModel } from '@cambrian/app/models/ProposalModel'
import { CeramicTemplateModel } from '@cambrian/app/models/TemplateModel'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { StringHashmap } from '@cambrian/app/models/UtilityModels'

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

export type StageModel =
    | CompositionModel
    | CeramicTemplateModel
    | CeramicProposalModel

export type Stages = {
    [key in StageNames]: StageModel
}
