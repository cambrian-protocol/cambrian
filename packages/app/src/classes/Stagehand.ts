import { CompositionModel } from '../models/CompositionModel'
import { CreateTemplateFormType } from '../ui/templates/forms/CreateTemplateForm'
import { IPFSAPI } from '../services/api/IPFS.api'
import { ProposalModel } from '../models/ProposalModel'
import { SolutionModel } from '../models/SolutionModel'
import { TemplateModel } from '../models/TemplateModel'
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

type Stages = {
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

    publishStages = async () => {
        try {
            const res = await this.ipfs.pin(this.stages)
            if (res && res.IpfsHash) {
                console.log('Published stages: ', this.stages)
                return res.IpfsHash
            }
        } catch (e) {
            console.error(e)
            return undefined
        }
    }

    /**
     * Load stage from IPFS
     */
    loadStage = async (stagesCID: string, stageType: StageNames) => {
        try {
            const stages = (await this.ipfs.getFromCID(stagesCID)) as Stages
            console.log('Fetched stages: ', stages)
            this.stages = stages
            return stages[stageType]
        } catch (e) {
            console.log(e)
            return undefined
        }
    }

    // TODO
    isStageSchema = (data: StageModel, stage: StageNames) => {
        return true
    }

    /**
     * Creates a Composition and publishes it to IPFS
     */
    publishComposition = async (composition: CompositionModel) => {
        if (!this.isStageSchema(composition, StageNames.composition)) {
            console.error(
                `Error: ${composition} does not satisfy ${StageNames.composition} schema`
            )
            return undefined
        }
        this.stages['composition'] = composition

        return this.publishStages()
    }

    /**
     * Creates a template by applying CreateTemplateForm to a loaded composition and publishes it to IPFS
     */
    publishTemplate = async (createTemplateForm: CreateTemplateFormType) => {
        if (!this.stages.composition) {
            console.error('Error: Load a composition into Stagehand first')
            return undefined
        }

        const updatedComposition = mergeFlexIntoComposition(
            <CompositionModel>this.stages.composition,
            createTemplateForm.flexInputs
        )

        if (updatedComposition) {
            const template: TemplateModel = {
                updatedComposition: updatedComposition,
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
            return this.publishStages()
        } else {
            console.error('Error merging provided flex inputs into composition')
            return undefined
        }
    }
}
