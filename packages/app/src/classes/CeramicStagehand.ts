import { CeramicProposalModel } from '@cambrian/app/models/ProposalModel'
import { CeramicTemplateModel } from '@cambrian/app/models/TemplateModel'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { CreateProposalMultiStepFormType } from '../ui/proposals/forms/CreateProposalMultiStepForm'
import { CreateTemplateMultiStepFormType } from '../ui/templates/forms/CreateTemplateMultiStepForm'
import { GENERAL_ERROR } from '@cambrian/app/constants/ErrorMessages'
import { SelfID } from '@self.id/framework'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { cpLogger } from '../services/api/Logger.api'
import { ethers } from 'ethers'
import { mergeFlexIntoComposition } from '../utils/transformers/Composition'
import { parseComposerSolvers } from '../utils/transformers/ComposerTransformer'

export enum StageNames {
    composition = 'composition',
    template = 'template',
    proposal = 'proposal',
}

type StageModel = CompositionModel | CeramicTemplateModel | CeramicProposalModel

export type Stages = {
    [key in StageNames]: StageModel
}

export default class CeramicStagehand {
    // TODO
    isStageSchema = (data: StageModel, stage: StageNames) => {
        return true
    }

    createComposition = async (
        compositionStreamID: string, // User-provided ID
        composition: CompositionModel,
        selfId: SelfID
    ) => {
        if (!this.isStageSchema(composition, StageNames.composition)) {
            throw GENERAL_ERROR['WRONG_COMPOSITION_SCHEMA']
        }

        try {
            const doc = await TileDocument.deterministic(
                selfId.client.ceramic,
                {
                    controllers: [selfId.id],
                    family: 'cambrian-composition',
                    tags: [compositionStreamID],
                }
            )

            await doc.update(composition)

            const compositionLib = await TileDocument.deterministic(
                selfId.client.ceramic,
                {
                    controllers: [selfId.id],
                    family: 'cambrian-lib',
                    tags: ['compositions'],
                },
                { pin: true }
            )

            if (
                typeof compositionLib.content === 'object' &&
                compositionLib.content !== null
            ) {
                await compositionLib.update({
                    ...compositionLib.content,
                    [compositionStreamID]: doc.id.toString(),
                })
            } else {
                await compositionLib.update({
                    [compositionStreamID]: doc.id.toString(),
                })
            }

            return doc.id.toString()
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
        }
    }

    createTemplate = async (
        templateStreamID: string,
        createTemplateInput: CreateTemplateMultiStepFormType,
        compositionStreamID: string,
        selfID: SelfID
    ) => {
        try {
            const composition = await TileDocument.load(
                selfID.client.ceramic,
                compositionStreamID
            )

            const template: CeramicTemplateModel = {
                title: createTemplateInput.title,
                description: createTemplateInput.description,
                proposalRequest: createTemplateInput.proposalRequest,
                price: {
                    amount: createTemplateInput.askingAmount,
                    denominationTokenAddress:
                        createTemplateInput.denominationTokenAddress,
                    preferredTokens: createTemplateInput.preferredTokens,
                    allowAnyPaymentToken:
                        createTemplateInput.allowAnyPaymentToken,
                },
                flexInputs: createTemplateInput.flexInputs,
                composition: {
                    streamID: compositionStreamID,
                    commitID: composition.commitId.toString(),
                },
            }

            if (!this.isStageSchema(template, StageNames.template)) {
                throw GENERAL_ERROR['WRONG_TEMPLATE_SCHEMA']
            }

            const doc = await TileDocument.deterministic(
                selfID.client.ceramic,
                {
                    controllers: [selfID.id],
                    family: 'cambrian-template',
                    tags: [templateStreamID],
                }
            )

            await doc.update(template)

            const templateLib = await TileDocument.deterministic(
                selfID.client.ceramic,
                {
                    controllers: [selfID.id],
                    family: 'cambrian-lib',
                    tags: ['templates'],
                },
                { pin: true }
            )

            if (
                typeof templateLib.content === 'object' &&
                templateLib.content !== null
            ) {
                await templateLib.update({
                    ...templateLib.content,
                    [templateStreamID]: doc.id.toString(),
                })
            } else {
                await templateLib.update({
                    [templateStreamID]: doc.id.toString(),
                })
            }

            return doc.id.toString()
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
        }
    }

    createProposal = async (
        proposalStreamID: string,
        createProposalInput: CreateProposalMultiStepFormType,
        templateStreamID: string,
        selfID: SelfID,
        provider: ethers.providers.Provider
    ) => {
        try {
            const template: TileDocument<CeramicTemplateModel> =
                await TileDocument.load(selfID.client.ceramic, templateStreamID)

            const composition: TileDocument<CompositionModel> =
                await TileDocument.load(
                    selfID.client.ceramic,
                    template.content.composition.commitID
                )

            const newComposition = mergeFlexIntoComposition(
                mergeFlexIntoComposition(
                    composition.content,
                    template.content.flexInputs
                ),
                createProposalInput.flexInputs
            )

            const parsedSolvers = await parseComposerSolvers(
                newComposition.solvers,
                provider
            )

            if (parsedSolvers) {
                const proposal: CeramicProposalModel = {
                    title: createProposalInput.title,
                    description: createProposalInput.description,
                    template: {
                        streamID: templateStreamID,
                        commitID: template.commitId.toString(),
                    },
                    flexInputs: createProposalInput.flexInputs,
                }

                if (!this.isStageSchema(proposal, StageNames.proposal)) {
                    throw GENERAL_ERROR['WRONG_PROPOSAL_SCHEMA']
                }

                // TODO put proposal to cambrian controlled stream

                const doc = await TileDocument.deterministic(
                    selfID.client.ceramic,
                    {
                        controllers: [selfID.id],
                        family: 'cambrian-proposal',
                        tags: [proposalStreamID],
                    }
                )

                await doc.update(proposal)

                const proposalLib = await TileDocument.deterministic(
                    selfID.client.ceramic,
                    {
                        controllers: [selfID.id],
                        family: 'cambrian-lib',
                        tags: ['proposals'],
                    },
                    { pin: true }
                )

                if (
                    typeof proposalLib.content === 'object' &&
                    proposalLib.content !== null
                ) {
                    await proposalLib.update({
                        ...proposalLib.content,
                        [proposalStreamID]: doc.id.toString(),
                    })
                } else {
                    await proposalLib.update({
                        [proposalStreamID]: doc.id.toString(),
                    })
                }

                return doc.id.toString()
            }
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
        }
    }

    receiveProposal = async (proposalStreamID: string, selfID: SelfID) => {
        try {
            const proposal = await TileDocument.load(
                selfID.client.ceramic,
                proposalStreamID
            )

            if (proposal.content !== null) {
                const openProposal = await TileDocument.deterministic(
                    selfID.client.ceramic,
                    {
                        controllers: [selfID.id],
                        family: 'cambrian-proposal',
                        tags: [proposalStreamID],
                    }
                )

                openProposal.update(proposal.content)
            }
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
        }
    }

    loadStream = async (streamID: string, selfID: SelfID) => {
        try {
            const doc = await TileDocument.load(selfID.client.ceramic, streamID)

            return doc.content
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
        }
    }

    loadCompositionLib = async (selfID: SelfID) => {
        this.loadCollection(selfID, 'compositions')
    }
    loadTemplateLib = async (selfID: SelfID) => {
        this.loadCollection(selfID, 'templates')
    }
    loadProposalLib = async (selfID: SelfID) => {
        this.loadCollection(selfID, 'proposals')
    }

    loadCollection = async (
        selfID: SelfID,
        collection: 'compositions' | 'templates' | 'proposals'
    ) => {
        try {
            const compositionLib = await TileDocument.deterministic(
                selfID.client.ceramic,
                {
                    controllers: [selfID.id],
                    family: 'cambrian-lib',
                    tags: [collection],
                },
                { pin: true }
            )

            return compositionLib.content
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_LOAD_ERROR']
        }
    }
}
