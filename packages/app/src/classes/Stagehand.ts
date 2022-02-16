import { create } from 'lodash'
import { ProposalModel } from '../models/ProposalModel'
import { SolutionModel } from '../models/SolutionModel'
import { SolverModel } from '../models/SolverModel'
import { TemplateModel } from '../models/TemplateModel'
import { IPFSAPI } from '../services/api/IPFS.api'
import { CreateTemplateFormType } from '../ui/solutions/common/forms/CreateTemplateForm'
import { mergeFlexIntoComposition } from '../utils/transformers/Composition'

enum Stages {
    composition = 'composition',
    template = 'template',
    solution = 'solution',
    proposal = 'proposal',
}

type CompositionModel = SolverModel[]
type StageModel =
    | CompositionModel
    | TemplateModel
    | SolutionModel
    | ProposalModel

type StageIds = {
    [key in Stages]: string
}

export default class Stagehand {
    ipfs: IPFSAPI
    stageIds: StageIds
    composition?: CompositionModel
    template?: TemplateModel
    solution?: SolutionModel
    proposal?: ProposalModel

    constructor() {
        this.ipfs = new IPFSAPI()
        this.stageIds = {} as StageIds
    }

    /**
     * Create a template by applying CreateTemplateForm to loaded composition
     */
    createTemplate = async (createTemplateForm: CreateTemplateFormType) => {
        if (!this.composition) {
            console.error('')
            return undefined
        }

        const newComposition = mergeFlexIntoComposition(
            this.composition,
            createTemplateForm.flexInputs
        )

        if (newComposition) {
            const template = <TemplateModel>{
                composition: newComposition,
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
            this.template = template
            return template
        } else {
            console.error('Error merging provided flex inputs into composition')
            return undefined
        }
    }

    loadStage = async (stageId: string, stageType: Stages) => {
        try {
            const stage = (await this.ipfs.getFromCID(stageId)) as StageModel
            return this.setStage(stage, stageId, stageType)
        } catch (e) {
            console.log(e)
            return undefined
        }
    }

    setStage = (stage: StageModel, stageId: string, stageType: Stages) => {
        if (!stage || !this.isStageSchema(stage, stageType)) {
            return undefined
        }

        switch (stageType) {
            case Stages.composition:
                this.composition = stage as CompositionModel
                this.stageIds['composition'] = stageId
                return this.composition

            case Stages.template:
                this.template = stage as TemplateModel
                return this.template

            case Stages.solution:
                this.solution = stage as SolutionModel
                return this.solution

            case Stages.proposal:
                this.proposal = stage as ProposalModel
                return this.proposal
        }
    }

    // TODO
    isStageSchema = (data: StageModel, stage: Stages) => {
        switch (stage) {
            case Stages.composition:
                return true

            case Stages.template:
                return true

            case Stages.solution:
                return true

            case Stages.composition:
                return true
        }
    }
}
