import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { CreateProposalMultiStepFormType } from './../ui/proposals/forms/CreateProposalMultiStepForm'
import { CreateTemplateMultiStepFormType } from '../ui/templates/forms/CreateTemplateMultiStepForm'
import { GENERAL_ERROR } from '@cambrian/app/constants/ErrorMessages'
import { IPFSAPI } from '../services/api/IPFS.api'
import { ProposalModel } from '@cambrian/app/models/ProposalModel'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
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

    publishStage = async (stageType: StageNames) => {
        try {
            const res = await this.ipfs.pin(this.stages[stageType])
            if (res && res.IpfsHash) {
                return res.IpfsHash
            }
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['IPFS_PIN_ERROR']
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

    // TODO
    isStageSchema = (data: StageModel, stage: StageNames) => {
        return true
    }

    /**
     * Creates a Composition and publishes it to IPFS
     */
    publishComposition = async (
        composition: CompositionModel,
        provider: ethers.providers.Provider
    ) => {
        if (!this.isStageSchema(composition, StageNames.composition)) {
            throw GENERAL_ERROR['WRONG_COMPOSITION_SCHEMA']
        }

        if (await parseComposerSolvers(composition.solvers, provider)) {
            this.stages['composition'] = composition
            return this.publishStage(StageNames.composition)
        }
    }

    /**
     * Creates a template by applying CreateTemplateForm to a loaded composition and publishes it to IPFS
     */
    publishTemplate = async (
        createTemplateInput: CreateTemplateMultiStepFormType,
        compositionCID: string,
        provider: ethers.providers.Provider
    ) => {
        if (!this.composition) {
            await this.loadStage(compositionCID, StageNames.composition)
        }

        const newComposition = mergeFlexIntoComposition(
            this.composition!,
            createTemplateInput.flexInputs
        )
        await parseComposerSolvers(newComposition.solvers, provider)

        const template: TemplateModel = {
            pfp: createTemplateInput.pfp,
            name: createTemplateInput.name,
            title: createTemplateInput.title,
            description: createTemplateInput.description,
            price: {
                amount: createTemplateInput.askingAmount,
                denominationTokenAddress:
                    createTemplateInput.denominationTokenAddress,
                preferredTokens: createTemplateInput.preferredTokens,
                allowAnyPaymentToken: createTemplateInput.allowAnyPaymentToken,
            },
            flexInputs: createTemplateInput.flexInputs,
            compositionCID: compositionCID,
        }

        if (!this.isStageSchema(template, StageNames.template)) {
            throw GENERAL_ERROR['WRONG_TEMPLATE_SCHEMA']
        }
        this.stages['template'] = template
        return this.publishStage(StageNames.template)
    }

    publishProposal = async (
        createProposalInput: CreateProposalMultiStepFormType,
        templateCID: string,
        provider: ethers.providers.Provider
    ) => {
        if (!this.template) {
            await this.loadStage(templateCID, StageNames.template)
        }

        if (this.template && !this.composition) {
            await this.loadStage(
                this.template.compositionCID,
                StageNames.composition
            )
        }

        const newComposition = mergeFlexIntoComposition(
            mergeFlexIntoComposition(
                this.composition!,
                this.template!.flexInputs
            ),
            createProposalInput.flexInputs
        )
        const parsedSolvers = await parseComposerSolvers(
            newComposition.solvers,
            provider
        )
        if (parsedSolvers) {
            const proposal: ProposalModel = {
                title: createProposalInput.title,
                name: createProposalInput.name,
                pfp: createProposalInput.pfp,
                description: createProposalInput.description,
                templateCID: templateCID,
                flexInputs: createProposalInput.flexInputs,
            }

            this.stages[StageNames.proposal] = proposal
            const proposalCID = await this.publishStage(StageNames.proposal)
            if (proposalCID) {
                return {
                    parsedSolvers: parsedSolvers,
                    cid: proposalCID,
                }
            }
        }
    }
}

export const getSolverConfigsFromMetaStages = async (
    metaStages: Stages,
    provider: ethers.providers.Provider
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
        provider
    )
    if (!parsedSolvers) throw GENERAL_ERROR['PARSE_SOLVER_ERROR']
    return parsedSolvers.map((solver) => solver.config)
}
