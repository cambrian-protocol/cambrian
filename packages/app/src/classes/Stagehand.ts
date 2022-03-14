import { parseComposerSolvers } from '@cambrian/app/utils/transformers/ComposerTransformer'
import { UserType } from '@cambrian/app/store/UserContext'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import { CreateProposalFormType } from './../ui/proposals/forms/CreateProposalForm'
import { CompositionModel } from '../models/CompositionModel'
import { CreateTemplateFormType } from '../ui/templates/forms/CreateTemplateForm'
import { IPFSAPI } from '../services/api/IPFS.api'
import { ProposalModel } from '../models/ProposalModel'
import { SolutionModel } from '../models/SolutionModel'
import { mergeFlexIntoComposition } from '../utils/transformers/Composition'
import { ContractReceipt, ContractTransaction, ethers } from 'ethers'
import { getBytes32FromMultihash } from '../utils/helpers/multihash'
import { ulid } from 'ulid'
const FACTORY_ABI = require('../artifacts/SolverFactory.json').abi
const SOLVER_ABI = require('../artifacts/Solver.json').abi
const IPFS_SOLUTIONS_HUB_ABI = require('../artifacts/IPFSSolutionsHub.json').abi
const PROPOSALS_HUB_ABI = require('../artifacts/ProposalsHub.json').abi
const Hash = require('ipfs-only-hash')

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
        createProposalInput: CreateProposalFormType,
        user: UserType,
        provider: ethers.providers.Web3Provider
    ) => {
        const template = <TemplateModel>this.stages[StageNames.template]

        const finalComposition = mergeFlexIntoComposition(
            template.updatedComposition,
            createProposalInput.flexInputs
        )

        if (finalComposition) {
            const parsedSolvers = await parseComposerSolvers(
                finalComposition.solvers
            )

            if (parsedSolvers) {
                const solverFactoryContract = new ethers.Contract(
                    '0xe7f1725e7734ce288f8367e1bb143e90bb3f0512',
                    new ethers.utils.Interface(FACTORY_ABI),
                    ethers.getDefaultProvider()
                )

                const deployedSolvers: ethers.Contract[] = []
                const promises: Promise<{}>[] = []

                const tx: ContractTransaction = await solverFactoryContract
                    .connect(user.signer)
                    .createSolver(
                        ethers.constants.AddressZero,
                        0,
                        parsedSolvers[0].config
                    )

                const receipt: ContractReceipt = await tx.wait()

                if (receipt && receipt.events) {
                    deployedSolvers.push(
                        new ethers.Contract(
                            ethers.utils.defaultAbiCoder.decode(
                                ['address'],
                                receipt.events[0].data
                            )[0],
                            SOLVER_ABI,
                            provider
                        )
                    )

                    // Deploy solver chain
                    if (parsedSolvers.length > 0) {
                        parsedSolvers.forEach((parsedSolver, index) => {
                            if (index > 0) {
                                let p = deployedSolvers[index - 1]
                                    .connect(user.signer)
                                    .deployChild(parsedSolver.config)
                                    .then((tx: ContractTransaction) =>
                                        tx.wait()
                                    )
                                    .then((receipt: ContractReceipt) => {
                                        if (receipt && receipt.events) {
                                            deployedSolvers.push(
                                                new ethers.Contract(
                                                    ethers.utils.defaultAbiCoder.decode(
                                                        ['address'],
                                                        receipt.events[0].data
                                                    )[0],
                                                    SOLVER_ABI,
                                                    provider
                                                )
                                            )
                                        }
                                    })
                                promises.push(p)
                            }
                        })
                    }

                    await Promise.all(promises)

                    const solverConfigs = parsedSolvers.map(
                        (solver) => solver.config
                    )
                    const solverConfigCID = await Hash.of(
                        JSON.stringify(solverConfigs)
                    )

                    const solverAddresses = deployedSolvers.map(
                        (solver) => solver.address
                    )

                    const solutionId = ethers.utils.formatBytes32String(ulid())

                    const ipfsSolutionsHubContract = new ethers.Contract(
                        '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
                        new ethers.utils.Interface(IPFS_SOLUTIONS_HUB_ABI),
                        ethers.getDefaultProvider()
                    )

                    await ipfsSolutionsHubContract
                        .connect(user.signer)
                        .createSolution(
                            solutionId,
                            finalComposition.solvers[0].config
                                .collateralToken!!,
                            solverConfigs,
                            getBytes32FromMultihash(solverConfigCID)
                        )

                    const proposalsHubContract = new ethers.Contract(
                        '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
                        new ethers.utils.Interface(PROPOSALS_HUB_ABI),
                        ethers.getDefaultProvider()
                    )

                    let tx = await proposalsHubContract
                        .connect(user.signer)
                        .createProposal(
                            finalComposition.solvers[0].config
                                .collateralToken!!,
                            ipfsSolutionsHubContract.address,
                            template.price?.amount,
                            solutionId
                        )

                    let rc = await tx.wait()
                    const proposalId = new ethers.utils.Interface([
                        'event CreateProposal(bytes32 id)',
                    ]).parseLog(rc.logs[0]).args.id

                    // TODO Get total supply of collateral Token
                    const solution: SolutionModel = {
                        id: solutionId,
                        isExecuted: false,
                        seller: {
                            name: template.name,
                            address: 'TODO',
                            pfp: template.pfp,
                        },
                        collateralToken: {
                            address:
                                finalComposition.solvers[0].config
                                    .collateralToken!!,
                            totalSupply: 0,
                        },
                        finalComposition: finalComposition,
                        proposalId: proposalId,
                        solverAddresses: solverAddresses,
                        solverConfigsCID: solverConfigCID,
                    }
                    this.stages[StageNames.solution] = solution

                    const proposal: ProposalModel = {
                        id: proposalId,
                        title: createProposalInput.title,
                        buyer: { address: '' },
                        description: createProposalInput.description,
                        amount: createProposalInput.price,
                    }
                    this.stages[StageNames.proposal] = proposal
                    return this.publishStages()
                }
            }
        }
        return undefined
    }
}
