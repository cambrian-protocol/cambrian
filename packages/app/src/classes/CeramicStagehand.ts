import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { CreateProposalMultiStepFormType } from '../ui/proposals/forms/CreateProposalMultiStepForm'
import { CreateTemplateMultiStepFormType } from '../ui/templates/forms/CreateTemplateMultiStepForm'
import { GENERAL_ERROR } from '@cambrian/app/constants/ErrorMessages'
import { IPFSAPI } from '../services/api/IPFS.api'
import { CeramicProposalModel } from '@cambrian/app/models/ProposalModel'
import {
    CeramicTemplateModel,
    TemplateModel,
} from '@cambrian/app/models/TemplateModel'
import { cpLogger } from '../services/api/Logger.api'
import { ethers } from 'ethers'
import { mergeFlexIntoComposition } from '../utils/transformers/Composition'
import { parseComposerSolvers } from '../utils/transformers/ComposerTransformer'
import { UserType } from '../store/UserContext'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import UserMenuItemLabel from '../components/menu/UserMenuItemLabel'
import { TileLoader } from '@glazed/tile-loader'

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
        id: string, // User-provided ID
        composition: CompositionModel,
        currentUser: UserType
    ) => {
        if (!this.isStageSchema(composition, StageNames.composition)) {
            throw GENERAL_ERROR['WRONG_COMPOSITION_SCHEMA']
        }

        try {
            const doc = await TileDocument.deterministic(
                //@ts-ignore
                currentUser.selfID?.client.ceramic,
                {
                    controllers: [currentUser.selfID!.id],
                    family: 'cambrian-composition',
                    tags: [id],
                }
            )

            await doc.update(composition)

            const compositionLib = await TileDocument.deterministic(
                //@ts-ignore
                currentUser.selfID?.client.ceramic,
                {
                    controllers: [currentUser.selfID!.id],
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
                    [id]: doc.id.toString(),
                })
            } else {
                await compositionLib.update({ [id]: doc.id.toString() })
            }

            return doc.id.toString()
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
        }
    }

    loadComposition = async (streamID: string, currentUser: UserType) => {
        try {
            const doc = await TileDocument.load(
                //@ts-ignore
                currentUser.selfID?.client.ceramic,
                streamID
            )

            return doc.content
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
        }
    }

    createTemplate = async (
        id: string,
        createTemplateInput: CreateTemplateMultiStepFormType,
        compositionStreamID: string,
        currentUser: UserType
    ) => {
        try {
            const composition = await TileDocument.load(
                //@ts-ignore
                currentUser.selfID?.client.ceramic,
                compositionStreamID
            )

            const template: CeramicTemplateModel = {
                title: createTemplateInput.title,
                description: createTemplateInput.description,
                rfp: createTemplateInput.rfp,
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
                //@ts-ignore
                currentUser.selfID?.client.ceramic,
                {
                    controllers: [currentUser.selfID!.id],
                    family: 'cambrian-template',
                    tags: [id],
                }
            )

            await doc.update(template)

            const templateLib = await TileDocument.deterministic(
                //@ts-ignore
                currentUser.selfID?.client.ceramic,
                {
                    controllers: [currentUser.selfID!.id],
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
                    [id]: doc.id.toString(),
                })
            } else {
                await templateLib.update({ [id]: doc.id.toString() })
            }

            return doc.id.toString()
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
        }
    }

    createProposal = async (
        id: string,
        createProposalInput: CreateProposalMultiStepFormType,
        templateStreamID: string,
        currentUser: UserType
    ) => {
        try {
            const template: TileDocument<CeramicTemplateModel> =
                await TileDocument.load(
                    currentUser.selfID!.client.ceramic,
                    templateStreamID
                )

            const composition: TileDocument<CompositionModel> =
                await TileDocument.load(
                    currentUser.selfID!.client.ceramic,
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
                currentUser.provider
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

                const doc = await TileDocument.deterministic(
                    //@ts-ignore
                    currentUser.selfID?.client.ceramic,
                    {
                        controllers: [currentUser.selfID!.id],
                        family: 'cambrian-proposal',
                        tags: [id],
                    }
                )

                await doc.update(proposal)

                const proposalLib = await TileDocument.deterministic(
                    //@ts-ignore
                    currentUser.selfID?.client.ceramic,
                    {
                        controllers: [currentUser.selfID!.id],
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
                        [id]: doc.id.toString(),
                    })
                } else {
                    await proposalLib.update({ [id]: doc.id.toString() })
                }

                return doc.id.toString()
            }
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
        }
    }

    receiveProposal = async (
        proposalStreamID: string,
        currentUser: UserType
    ) => {
        try {
            const proposal = await TileDocument.load(
                //@ts-ignore
                currentUser.selfID?.client.ceramic,
                proposalStreamID
            )

            if (proposal.content !== null) {
                const openProposal = await TileDocument.deterministic(
                    //@ts-ignore
                    currentUser.selfID?.client.ceramic,
                    {
                        controllers: [currentUser.selfID!.id],
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

    loadCompositionLib = async (currentUser: UserType) => {
        try {
            const compositionLib = await TileDocument.deterministic(
                //@ts-ignore
                currentUser.selfID?.client.ceramic,
                {
                    controllers: [currentUser.selfID!.id],
                    family: 'cambrian-lib',
                    tags: ['compositions'],
                },
                { pin: true }
            )

            return compositionLib.content
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_LOAD_ERROR']
        }
    }

    loadTemplateLib = async (currentUser: UserType) => {
        try {
            const templateLib = await TileDocument.deterministic(
                //@ts-ignore
                currentUser.selfID?.client.ceramic,
                {
                    controllers: [currentUser.selfID!.id],
                    family: 'cambrian-lib',
                    tags: ['templates'],
                },
                { pin: true }
            )

            return templateLib.content
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_LOAD_ERROR']
        }
    }

    loadProposalLib = async (currentUser: UserType) => {
        try {
            const proposalLib = await TileDocument.deterministic(
                //@ts-ignore
                currentUser.selfID?.client.ceramic,
                {
                    controllers: [currentUser.selfID!.id],
                    family: 'cambrian-lib',
                    tags: ['proposals'],
                },
                { pin: true }
            )

            return proposalLib.content
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_LOAD_ERROR']
        }
    }
}
