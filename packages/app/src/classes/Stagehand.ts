import { CompositionModel } from '../models/CompositionModel'
import { ProposalModel } from '../models/ProposalModel'
import { SolutionModel } from '../models/SolutionModel'
import { TemplateModel } from '../models/TemplateModel'
import { IPFSAPI } from '../services/api/IPFS.api'
import { CreateTemplateFormType } from '../ui/templates/forms/CreateTemplateForm'
import { mergeFlexIntoComposition } from '../utils/transformers/Composition'

export enum StageNames {
    composition = 'composition',
    template = 'template',
    solution = 'solution',
    proposal = 'proposal',
}

type StageModel =
    | CompositionModel
    | TemplateModel
    | SolutionModel
    | ProposalModel

type StageIds = {
    [key in StageNames]: string
}

type Stages = {
    [key in StageNames]: StageModel
}

export default class Stagehand {
    ipfs: IPFSAPI
    stageIds: StageIds
    stages: Stages

    constructor() {
        this.ipfs = new IPFSAPI()
        this.stageIds = {} as StageIds
        this.stages = {} as Stages
    }

    get composition() {
        return this.stages.composition
    }

    get template() {
        return this.stages.template
    }

    get solution() {
        return this.stages.solution
    }

    get proposal() {
        return this.stages.proposal
    }

    get compositionId() {
        return this.stageIds.composition
    }

    get templateId() {
        return this.stageIds.template
    }

    get solutionId() {
        return this.stageIds.solution
    }

    get proposalId() {
        return this.stageIds.proposal
    }

    /**
     * Create a template by applying CreateTemplateForm to a loaded composition
     */
    createTemplate = async (createTemplateForm: CreateTemplateFormType) => {
        if (!this.stages.composition) {
            console.error('Error: Load a composition into Stagehand first')
            return undefined
        }

        const newComposition = mergeFlexIntoComposition(
            <CompositionModel>this.stages.composition,
            createTemplateForm.flexInputs
        )

        if (newComposition) {
            const template: TemplateModel = {
                composerSolvers: newComposition.solvers,
                pfp: createTemplateForm.pfp,
                name: createTemplateForm.name,
                title: createTemplateForm.title,
                description: createTemplateForm.description,
                price: {
                    amount: createTemplateForm.askingAmount,
                    denominationToken: createTemplateForm.denominationToken,
                    preferredTokens: createTemplateForm.preferredTokens,
                },
            }

            if (!this.isStageSchema(template, StageNames.template)) {
                console.error(
                    'Error: Generated template does not satisfy template schema'
                )
                return undefined
            }
            this.stages['template'] = template
            return template
        } else {
            console.error('Error merging provided flex inputs into composition')
            return undefined
        }
    }

    /**
     * Publish Stage by pinning to IPFS
     */
    publishStage = async (stageType: StageNames) => {
        if (
            !this.stages[stageType] ||
            !this.isStageSchema(this.stages[stageType], StageNames.template)
        ) {
            console.error(
                `Error: ${stageType} does not satisfy ${stageType} schema`
            )
            return undefined
        }

        try {
            const res = await this.ipfs.pin(this.stages[stageType])
            return res
        } catch (e) {
            console.error(e)
        }
    }

    /**
     * Load stage from IPFS
     */
    loadStage = async (stageId: string, stageType: StageNames) => {
        try {
            const stage = (await this.ipfs.getFromCID(stageId)) as StageModel
            return this.setStage(stage, stageId, stageType)
        } catch (e) {
            console.log(e)
            return undefined
        }
    }

    /**
     * Set internal stage variable
     */
    setStage = (stage: StageModel, stageId: string, stageType: StageNames) => {
        if (!stage || !this.isStageSchema(stage, stageType)) {
            return undefined
        }
        this.stageIds[stageType] = stageId
        this.stages[stageType] = stage
        return this.stages[stageType]
    }

    // TODO
    isStageSchema = (data: StageModel, stage: StageNames) => {
        return true
    }
}
