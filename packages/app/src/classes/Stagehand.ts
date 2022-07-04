import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { GENERAL_ERROR } from '@cambrian/app/constants/ErrorMessages'
import { IPFSAPI } from '../services/api/IPFS.api'
import { ProposalModel } from '@cambrian/app/models/ProposalModel'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { UserType } from '../store/UserContext'
import { cpLogger } from '../services/api/Logger.api'
import { ethers } from 'ethers'
import { mergeFlexIntoComposition } from '../utils/transformers/Composition'
import { parseComposerSolvers } from '../utils/transformers/ComposerTransformer'

export enum StageNames {
    composition = 'composition',
    template = 'template',
    proposal = 'proposal',
}

type StageModel = CompositionModel | TemplateModel | ProposalModel

export type Stages = {
    [key in StageNames]: StageModel
}

export default class Stagehand {
    ipfs: IPFSAPI
    stages: Stages

    constructor() {
        this.ipfs = new IPFSAPI()
        this.stages = {} as Stages
    }

    get composition() {
        return this.stages.composition as CompositionModel | undefined
    }

    get template() {
        return this.stages.template as TemplateModel | undefined
    }

    get proposal() {
        return this.stages.proposal as ProposalModel | undefined
    }

    /**
     * Load stage from IPFS
     */
    loadStage = async (stageCID: string, stageType: StageNames) => {
        try {
            const stage = (await this.ipfs.getFromCID(stageCID)) as StageModel
            this.stages[stageType] = stage
            return this.stages[stageType]
        } catch (e) {
            await cpLogger.push(e)
            throw GENERAL_ERROR['IPFS_FETCH_ERROR']
        }
    }

    /**
     * Load stage and previous stages
     */
    loadStages = async (
        stageCID: string,
        stageType: StageNames
    ): Promise<Stages | undefined> => {
        const stage = await this.loadStage(stageCID, stageType)
        if (stage) {
            switch (stageType) {
                case StageNames.proposal:
                    return this.loadStages(
                        this.proposal!.templateCID,
                        StageNames.template
                    )
                case StageNames.template:
                    return this.loadStages(
                        this.template!.compositionCID,
                        StageNames.composition
                    )
                default:
                    return this.stages
            }
        }
    }
}

export const getSolverConfigsFromMetaStages = async (
    metaStages: Stages,
    currentUser: UserType
) => {
    const metaTemplate = metaStages.template as TemplateModel
    const metaProposal = metaStages.proposal as ProposalModel
    const finalComposition = mergeFlexIntoComposition(
        mergeFlexIntoComposition(
            metaStages.composition as CompositionModel,
            metaTemplate.flexInputs
        ),
        metaProposal.flexInputs
    )
    const parsedSolvers = await parseComposerSolvers(
        finalComposition.solvers,
        currentUser.provider
    )
    if (!parsedSolvers) throw GENERAL_ERROR['PARSE_SOLVER_ERROR']
    return parsedSolvers.map((solver) => solver.config)
}
