import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { ProposalModel } from '@cambrian/app/models/ProposalModel'
import { StageNames } from '@cambrian/app/models/StageModel'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { UserType } from '@cambrian/app/store/UserContext'
import { loadStageDoc } from '@cambrian/app/services/ceramic/CeramicUtils'

export const fetchStageTileDoc = async (
    currentUser: UserType,
    query: string,
    stageName: StageNames
) => {
    if (query) {
        const stage = await loadStageDoc<any>(currentUser, query)
        if (stage.content !== null && typeof stage.content === 'object') {
            if (stageName === StageNames.composition && stage.content.solvers) {
                // Its a Composition
                return stage as TileDocument<CompositionModel>
            } else if (
                stageName === StageNames.template &&
                stage.content.composition
            ) {
                // Its a Template
                return stage as TileDocument<TemplateModel>
            } else if (
                stageName === StageNames.proposal &&
                stage.content.template
            ) {
                // Its a Proposal
                return stage as TileDocument<ProposalModel>
            }
        }
    }
}

export const isComposition = (stage: any) => stage.solvers !== undefined
export const isTemplate = (stage: any) => stage.composition !== undefined
export const isProposal = (stage: any) => stage.template !== undefined
