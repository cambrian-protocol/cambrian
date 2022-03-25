import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { CreateProposalFormType } from './../ui/proposals/forms/CreateProposalForm'
import { CreateTemplateFormType } from '../ui/templates/forms/CreateTemplateForm'
import { IPFSAPI } from '../services/api/IPFS.api'
import { ProposalModel } from '@cambrian/app/models/ProposalModel'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import { mergeFlexIntoComposition } from '../utils/transformers/Composition'
import { parseComposerSolvers } from '../utils/transformers/ComposerTransformer'

export enum StageNames {
    composition = 'composition',
    template = 'template',
    proposal = 'proposal',
}

type StageModel = CompositionModel | TemplateModel | ProposalModel

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
        return this.stages.composition as CompositionModel | undefined
    }

    get template() {
        return this.stages.template as TemplateModel | undefined
    }

    get proposal() {
        return this.stages.proposal as ProposalModel | undefined
    }

    publishStage = async (stageType: StageNames) => {
        try {
            const res = await this.ipfs.pin(this.stages[stageType])
            if (res && res.IpfsHash) {
                return res.IpfsHash
            }
        } catch (e) {
            console.error(e, this.stages)
            return undefined
        }
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
            console.log(e)
            return undefined
        }
    }

    /**
     * Load stage and previous stages
     */
    loadStages = async (
        stageCID: string,
        stageType: StageNames
    ): Promise<Stages | undefined> => {
        try {
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

        if (await parseComposerSolvers(composition.solvers)) {
            this.stages['composition'] = composition
            return this.publishStage(StageNames.composition)
        }
    }

    /**
     * Creates a template by applying CreateTemplateForm to a loaded composition and publishes it to IPFS
     */
    publishTemplate = async (
        createTemplateInput: CreateTemplateFormType,
        compositionCID: string
    ) => {
        if (!this.composition) {
            try {
                await this.loadStage(compositionCID, StageNames.composition)
            } catch (e) {
                console.log('Error finding composition')
                return undefined
            }
        }

        try {
            const newComposition = mergeFlexIntoComposition(
                this.composition!,
                createTemplateInput.flexInputs
            )
            // TODO async
            parseComposerSolvers(newComposition.solvers)
        } catch (e) {
            console.log('Error parsing new composition')
            return undefined
        }

        const template: TemplateModel = {
            pfp: createTemplateInput.pfp,
            name: createTemplateInput.name,
            title: createTemplateInput.title,
            description: createTemplateInput.description,
            price: {
                amount: createTemplateInput.askingAmount,
                denominationToken: createTemplateInput.denominationToken,
                preferredTokens: createTemplateInput.preferredTokens,
            },
            flexInputs: createTemplateInput.flexInputs,
            compositionCID: compositionCID,
        }

        if (!this.isStageSchema(template, StageNames.template)) {
            console.error(
                'Error: Generated template does not satisfy template schema'
            )
            return undefined
        }
        this.stages['template'] = template
        return this.publishStage(StageNames.template)
    }

    publishProposal = async (
        createProposalInput: CreateProposalFormType,
        templateCID: string
    ) => {
        if (!this.template) {
            try {
                await this.loadStage(templateCID, StageNames.template)
            } catch (e) {
                console.log('Error finding template')
                return undefined
            }
        }

        if (this.template && !this.composition) {
            try {
                await this.loadStage(
                    this.template.compositionCID,
                    StageNames.composition
                )
            } catch (e) {
                console.log('Error finding composition')
                return undefined
            }
        }

        try {
            const newComposition = mergeFlexIntoComposition(
                mergeFlexIntoComposition(
                    this.composition!,
                    this.template!.flexInputs
                ),
                createProposalInput.flexInputs
            )
            // TODO async
            parseComposerSolvers(newComposition.solvers)
        } catch (e) {
            console.log('Error parsing new composition')
            return undefined
        }

        const proposal: ProposalModel = {
            title: createProposalInput.title,
            name: createProposalInput.name,
            pfp: createProposalInput.pfp,
            description: createProposalInput.description,
            flexInputs: createProposalInput.flexInputs,
            templateCID: templateCID, // TODO
        }

        this.stages[StageNames.proposal] = proposal
        return this.publishStage(StageNames.proposal)
    }
}
