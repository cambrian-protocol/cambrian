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

const CAMBRIAN_LIB_NAME = 'cambrian-lib'

export default class CeramicStagehand {
    selfID: SelfID

    constructor(selfID: SelfID) {
        this.selfID = selfID
    }

    // TODO
    isStageSchema = (data: StageModel, stage: StageNames) => {
        return true
    }

    createStream = async (streamID: string, data: any, stage: StageNames) => {
        if (!this.isStageSchema(data, stage)) {
            throw GENERAL_ERROR['WRONG_SCHEMA']
        }

        try {
            const currentDoc = await TileDocument.deterministic(
                this.selfID.client.ceramic,
                {
                    controllers: [this.selfID.id],
                    family: `cambrian-${stage}`,
                    tags: [streamID],
                }
            )

            await currentDoc.update(data)

            const currentStage = await TileDocument.deterministic(
                this.selfID.client.ceramic,
                {
                    controllers: [this.selfID.id],
                    family: CAMBRIAN_LIB_NAME,
                    tags: [stage],
                },
                { pin: true }
            )

            if (
                currentStage.content !== null &&
                typeof currentStage.content === 'object'
            ) {
                await currentStage.update({
                    ...currentStage.content,
                    [streamID]: currentDoc.id.toString(),
                })
            } else {
                await currentStage.update({
                    [streamID]: currentDoc.id.toString(),
                })
            }

            return currentDoc.id.toString()
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
        }
    }

    loadStream = async (streamID: string) => {
        try {
            const doc = await TileDocument.load(
                this.selfID.client.ceramic,
                streamID
            )
            return doc.content
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_LOAD_ERROR']
        }
    }

    loadStages = async (stage: StageNames) => {
        try {
            const stageLib = await TileDocument.deterministic(
                this.selfID.client.ceramic,
                {
                    controllers: [this.selfID.id],
                    family: CAMBRIAN_LIB_NAME,
                    tags: [stage],
                },
                { pin: true }
            )

            return stageLib.content
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_LOAD_ERROR']
        }
    }

    updateStream = async (streamID: string, data: any, stage: StageNames) => {
        this.createStream(streamID, data, stage)
    }

    deleteStream = async (streamID: string, stage: StageNames) => {
        try {
            const compositionCollection = await TileDocument.deterministic(
                this.selfID.client.ceramic,
                {
                    controllers: [this.selfID.id],
                    family: CAMBRIAN_LIB_NAME,
                    tags: [stage],
                },
                { pin: true }
            )

            if (
                compositionCollection.content !== null &&
                typeof compositionCollection.content === 'object'
            ) {
                const updatedCompositionCollection: { [key: string]: string } =
                    {
                        ...compositionCollection.content,
                    }

                delete updatedCompositionCollection[streamID]

                compositionCollection.update({
                    ...updatedCompositionCollection,
                })
            }
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
        }
    }

    createTemplate = async (
        templateStreamID: string,
        createTemplateInput: CreateTemplateMultiStepFormType,
        compositionStreamID: string
    ) => {
        try {
            const composition = await TileDocument.load(
                this.selfID.client.ceramic,
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
                author: this.selfID.did.toString(),
            }

            if (!this.isStageSchema(template, StageNames.template)) {
                throw GENERAL_ERROR['WRONG_TEMPLATE_SCHEMA']
            }

            const doc = await TileDocument.deterministic(
                this.selfID.client.ceramic,
                {
                    controllers: [this.selfID.id],
                    family: 'cambrian-template',
                    tags: [templateStreamID],
                }
            )

            await doc.update(template)

            const templateLib = await TileDocument.deterministic(
                this.selfID.client.ceramic,
                {
                    controllers: [this.selfID.id],
                    family: 'cambrian-lib',
                    tags: ['template'],
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
        provider: ethers.providers.Provider
    ) => {
        try {
            const template: TileDocument<CeramicTemplateModel> =
                await TileDocument.load(
                    this.selfID.client.ceramic,
                    templateStreamID
                )

            const composition: TileDocument<CompositionModel> =
                await TileDocument.load(
                    this.selfID.client.ceramic,
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
                    authors: [
                        template.content.author,
                        this.selfID.did.toString(),
                    ],
                }

                if (!this.isStageSchema(proposal, StageNames.proposal)) {
                    throw GENERAL_ERROR['WRONG_PROPOSAL_SCHEMA']
                }

                // TODO put proposal to cambrian controlled stream

                const doc = await TileDocument.deterministic(
                    this.selfID.client.ceramic,
                    {
                        controllers: [this.selfID.id],
                        family: 'cambrian-proposal',
                        tags: [proposalStreamID],
                    }
                )

                await doc.update(proposal)

                const proposalLib = await TileDocument.deterministic(
                    this.selfID.client.ceramic,
                    {
                        controllers: [this.selfID.id],
                        family: 'cambrian-lib',
                        tags: ['proposal'],
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

    sendProposal = async (proposalStreamID: string) => {
        try {
            // Hit mailbox server
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_WICKBOX}/propose`,
                {
                    method: 'POST',
                    body: proposalStreamID,
                }
            )

            if (res.status === 200) {
                return true
            }
        } catch (e) {
            console.log(e)
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

                await openProposal.update(proposal.content)
            }
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
        }
    }
}
