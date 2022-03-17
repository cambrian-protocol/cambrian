import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { SolverConfigModel } from '@cambrian/app/models/SolverConfigModel'
import { UserType } from '@cambrian/app/store/UserContext'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import { CreateProposalFormType } from './../ui/proposals/forms/CreateProposalForm'
import { CreateTemplateFormType } from '../ui/templates/forms/CreateTemplateForm'
import { IPFSAPI } from '../services/api/IPFS.api'
import { ProposalModel } from '../models/ProposalModel'
import { SolutionModel } from '../models/SolutionModel'
import { mergeFlexIntoComposition } from '../utils/transformers/Composition'
import { TokenAPI } from '../services/api/Token.api'
import { addTokenDecimals } from '../utils/helpers/tokens'

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
            console.error(e, this.stages)
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
    publishTemplate = async (createTemplateInput: CreateTemplateFormType) => {
        if (!this.stages.composition) {
            console.error('Error: Load a composition into Stagehand first')
            return undefined
        }

        const updatedComposition = mergeFlexIntoComposition(
            <CompositionModel>this.stages.composition,
            createTemplateInput.flexInputs
        )

        if (updatedComposition) {
            const template: TemplateModel = {
                updatedComposition: updatedComposition,
                pfp: createTemplateInput.pfp,
                name: createTemplateInput.name,
                title: createTemplateInput.title,
                description: createTemplateInput.description,
                price: {
                    amount: createTemplateInput.askingAmount,
                    denominationToken: createTemplateInput.denominationToken,
                    preferredTokens: createTemplateInput.preferredTokens,
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

    publishProposal = async (
        solutionId: string,
        proposalId: string,
        finalComposition: CompositionModel,
        createProposalInput: CreateProposalFormType,
        solverAddresses: string[],
        solverConfigsCID: string,
        solverConfigs: SolverConfigModel[],
        user: UserType
    ) => {
        const template = this.stages[StageNames.template] as TemplateModel

        const token = await TokenAPI.getTokenInfo(
            createProposalInput.tokenAddress
        )
        if (token) {
            const solution: SolutionModel = {
                id: solutionId,
                isExecuted: false,
                seller: {
                    name: template.name,
                    address: 'TODO',
                    pfp: template.pfp,
                },
                collateralToken: token,
                finalComposition: finalComposition,
                proposalId: proposalId,
                solverAddresses: solverAddresses,
                solverConfigsCID: solverConfigsCID,
                solverConfigs: solverConfigs,
            }

            this.stages[StageNames.solution] = solution

            const proposal: ProposalModel = {
                id: proposalId,
                title: createProposalInput.title,
                buyer: {
                    address: user.address,
                    name: createProposalInput.name,
                    pfp: createProposalInput.pfp,
                },
                description: createProposalInput.description,
                amount: addTokenDecimals(createProposalInput.price, token),
            }

            this.stages[StageNames.proposal] = proposal
            return this.publishStages()
        }
    }

    executeProposal = async () => {
        const solution = this.stages[StageNames.solution] as SolutionModel
        console.log(this.stages)
        solution.isExecuted = true
        return this.publishStages()
    }
}
