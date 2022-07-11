import {
    CeramicTemplateModel,
    ReceivedProposalPropsType,
} from '@cambrian/app/models/TemplateModel'

import { CeramicProposalModel } from '@cambrian/app/models/ProposalModel'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { FlexInputFormType } from '../ui/templates/forms/TemplateFlexInputsForm'
import { GENERAL_ERROR } from '@cambrian/app/constants/ErrorMessages'
import { ReceivedProposalsHashmapType } from './../models/TemplateModel'
import { SelfID } from '@self.id/framework'
import { StringHashmap } from '@cambrian/app/models/UtilityModels'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import _ from 'lodash'
import { cpLogger } from '../services/api/Logger.api'
import initialComposer from '../store/composer/composer.init'

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

    updateStage = async (
        streamID: string,
        data: StageModel,
        stage: StageNames
    ) => {
        if (!this.isStageSchema(data, stage)) {
            throw GENERAL_ERROR['WRONG_SCHEMA']
        }

        const currentData: TileDocument<StageModel> = await TileDocument.load(
            this.selfID.client.ceramic,
            streamID
        )

        const cleanedUserTitle = data.title.trim()

        if (currentData.content.title !== cleanedUserTitle) {
            // StageLib and Meta Tag must be updated
            const stageLib = await TileDocument.deterministic(
                this.selfID.client.ceramic,
                {
                    controllers: [this.selfID.id],
                    family: CAMBRIAN_LIB_NAME,
                    tags: [stage],
                },
                { pin: true }
            )

            const stages = stageLib.content as StringHashmap

            const currentTag = Object.keys(stages).find(
                (tag) => stages[tag] === streamID
            )
            if (!currentTag) throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']

            const updatedStageLib = {
                ...(stageLib.content as StringHashmap),
            }
            // Attach counter to tag in case it exists already
            let uniqueTag = cleanedUserTitle
            let counter = 1
            while (updatedStageLib[uniqueTag]) {
                uniqueTag = cleanedUserTitle + ` (${counter++})`
            }
            updatedStageLib[uniqueTag] = streamID
            delete updatedStageLib[currentTag]

            await stageLib.update(updatedStageLib)
            await currentData.update(
                { ...data, title: uniqueTag },
                { ...currentData.metadata, tags: [uniqueTag] }
            )
            return { uniqueTag: uniqueTag }
        } else {
            await currentData.update({ ...data, title: cleanedUserTitle })
            return { uniqueTag: cleanedUserTitle }
        }
    }

    createStage = async (tag: string, data: StageModel, stage: StageNames) => {
        if (!this.isStageSchema(data, stage)) {
            throw GENERAL_ERROR['WRONG_SCHEMA']
        }

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

            let uniqueTag = tag
            if (
                stageLib.content !== null &&
                typeof stageLib.content === 'object'
            ) {
                const stages = {
                    ...(stageLib.content as StringHashmap),
                }
                // Attach counter to tag in case it exists already
                let counter = 1
                while (stages[uniqueTag]) {
                    uniqueTag = tag + ` (${counter++})`
                }
            }

            // Overwrite title if tag wasn't unique
            if (uniqueTag !== tag) {
                data = { ...data, title: uniqueTag }
            }

            const currentDoc = await TileDocument.deterministic(
                this.selfID.client.ceramic,
                {
                    controllers: [this.selfID.id],
                    family: `cambrian-${stage}`,
                    tags: [uniqueTag],
                }
            )
            await currentDoc.update(data)
            const streamID = currentDoc.id.toString()

            if (
                stageLib.content !== null &&
                typeof stageLib.content === 'object'
            ) {
                await stageLib.update({
                    ...stageLib.content,
                    [uniqueTag]: streamID,
                })
            } else {
                await stageLib.update({
                    [uniqueTag]: streamID,
                })
            }

            return { uniqueTag: uniqueTag, streamID: streamID }
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
        }
    }

    createComposition = async (tag: string, composition?: CompositionModel) => {
        return await this.createStage(
            tag,
            composition
                ? composition
                : {
                      title: tag,
                      description: '',
                      flowElements: initialComposer.flowElements,
                      solvers: initialComposer.solvers,
                  },
            StageNames.composition
        )
    }

    createTemplate = async (tag: string, compositionStreamID: string) => {
        const composition: TileDocument<CompositionModel> =
            await TileDocument.load(
                this.selfID.client.ceramic,
                compositionStreamID
            )

        let isCollateralFlex = false
        const formFlexInputs: FlexInputFormType[] = []
        composition.content.solvers.forEach((solver) => {
            Object.keys(solver.slotTags).forEach((tagId) => {
                if (solver.slotTags[tagId].isFlex === true) {
                    if (tagId === 'collateralToken') {
                        isCollateralFlex = true
                    } else {
                        formFlexInputs.push({
                            ...solver.slotTags[tagId],
                            solverId: solver.id,
                            tagId: tagId,
                            value: '',
                        })
                    }
                }
            })
        })

        const template: CeramicTemplateModel = {
            title: tag,
            description: '',
            requirements: '',
            price: {
                amount: 0,
                denominationTokenAddress:
                    composition.content.solvers[0].config.collateralToken || '',
                preferredTokens: [],
                allowAnyPaymentToken: false,
                isCollateralFlex: isCollateralFlex,
            },
            flexInputs: formFlexInputs,
            composition: {
                streamID: compositionStreamID,
                commitID: composition.commitId.toString(),
            },
            author: this.selfID.did.id.toString(),
            receivedProposals: {},
        }

        return await this.createStage(tag, template, StageNames.template)
    }

    createProposal = async (tag: string, templateStreamID: string) => {
        const template: TileDocument<CeramicTemplateModel> =
            await TileDocument.load(
                this.selfID.client.ceramic,
                templateStreamID
            )

        const proposal: CeramicProposalModel = {
            title: tag,
            description: '',
            template: {
                streamID: templateStreamID,
                commitID: template.commitId.toString(),
            },
            flexInputs: template.content.flexInputs.filter(
                (flexInput) =>
                    flexInput.tagId !== 'collateralToken' &&
                    flexInput.value === ''
            ),
            author: this.selfID.did.id.toString(),
            price: {
                amount: 0,
                tokenAddress: template.content.price.denominationTokenAddress,
            },
            submitted: false,
        }

        return await this.createStage(tag, proposal, StageNames.proposal)
    }

    loadStream = async (streamID: string) => {
        try {
            const doc = await TileDocument.load(
                this.selfID.client.ceramic,
                streamID
            )
            return doc
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

    deleteStage = async (tag: string, stage: StageNames) => {
        try {
            const stageCollection = await TileDocument.deterministic(
                this.selfID.client.ceramic,
                {
                    controllers: [this.selfID.id],
                    family: CAMBRIAN_LIB_NAME,
                    tags: [stage],
                },
                { pin: true }
            )
            if (
                stageCollection.content !== null &&
                typeof stageCollection.content === 'object'
            ) {
                const updatedStageLib: StringHashmap = {
                    ...stageCollection.content,
                }

                delete updatedStageLib[tag]
                await stageCollection.update({
                    ...updatedStageLib,
                })
            }
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
        }
    }

    submitProposal = async (proposalStreamID: string) => {
        try {
            // Hit mailbox server
            /*  const res = await fetch(
                `${process.env.NEXT_PUBLIC_TRILOBOT}/propose`,
                {
                    method: 'POST',
                    body: proposalStreamID,
                }
            )

            if (res.status === 200) { */
            const proposalDoc = await TileDocument.load(
                this.selfID.client.ceramic,
                proposalStreamID
            )
            await proposalDoc.update({
                ...(proposalDoc.content as CeramicProposalModel),
                submitted: true,
            })
            return true
            //}
        } catch (e) {
            console.log(e)
        }
    }

    /**
    Returns the most recent submitted version of the proposal, returns undefined if a proposal is opened without being submitted */
    loadAndReceiveProposal = async (
        proposalStreamID: string
    ): Promise<
        | { proposalCommitID: string; proposalContent: CeramicProposalModel }
        | undefined
    > => {
        try {
            const proposalDoc = await this.loadStream(proposalStreamID)

            if (!proposalDoc) throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']

            const proposalContent = proposalDoc.content as CeramicProposalModel

            const templateDoc = await this.loadStream(
                proposalContent.template.streamID
            )

            if (!templateDoc) throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
            const templateContent = templateDoc.content as CeramicTemplateModel
            const proposalSubmissions =
                templateContent.receivedProposals[proposalStreamID]
            if (proposalSubmissions) {
                // We have an entry
                const latestRegisteredSubmission =
                    proposalSubmissions[proposalSubmissions.length - 1]

                if (proposalContent.submitted) {
                    if (
                        latestRegisteredSubmission.proposalCommitID !==
                        proposalDoc.commitId.toString()
                    ) {
                        // Register the new commit inside of the template
                        let updatedReceivedProposals: ReceivedProposalsHashmapType =
                            {}
                        if (templateContent.receivedProposals) {
                            updatedReceivedProposals = _.cloneDeep(
                                templateContent.receivedProposals
                            )
                        }
                        proposalSubmissions.push({
                            proposalCommitID: proposalDoc.commitId.toString(),
                        })

                        updatedReceivedProposals[proposalStreamID] =
                            proposalSubmissions

                        await templateDoc.update({
                            ...templateContent,
                            receivedProposals: updatedReceivedProposals,
                        })
                    }
                    // The most actual streamID version is flagged as submitted, so we return that one
                    return {
                        proposalCommitID: proposalDoc.commitId.toString(),
                        proposalContent: proposalContent,
                    }
                } else {
                    // The most recent StreamID version is not flagged as submitted, so we return the last received version
                    return {
                        proposalCommitID:
                            latestRegisteredSubmission.proposalCommitID,
                        proposalContent: (
                            await this.loadStream(
                                latestRegisteredSubmission.proposalCommitID
                            )
                        ).content as CeramicProposalModel,
                    }
                }
            } else {
                // A new unregistered proposal was received
                if (
                    proposalContent.submitted &&
                    this.selfID.did.id === templateContent.author
                ) {
                    // It is flagged as submitted, so we register it and return it
                    let updatedReceivedProposals: ReceivedProposalsHashmapType =
                        {}
                    if (templateContent.receivedProposals) {
                        updatedReceivedProposals = _.cloneDeep(
                            templateContent.receivedProposals
                        )
                    }

                    updatedReceivedProposals[proposalStreamID] = [
                        { proposalCommitID: proposalDoc.commitId.toString() },
                    ]

                    await templateDoc.update({
                        ...templateContent,
                        receivedProposals: updatedReceivedProposals,
                    })

                    return {
                        proposalContent: proposalContent,
                        proposalCommitID: proposalDoc.commitId.toString(),
                    }
                } else if (this.selfID.did.id === proposalContent.author) {
                    // For the author a preview is allowed
                    return {
                        proposalContent: proposalContent,
                        proposalCommitID: proposalDoc.commitId.toString(),
                    }
                }
                // It has not been submitted yet and the user is not the author, we return nothing/undefined
            }
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
        }
    }

    /**
     * Sets the flag requestChange at the templates receivedProposals[proposalStreamID] commit-entry to true.
     *
     * @param proposalStreamID StreamID
     * @auth Must be done by the template author
     *
     */
    requestProposalChange = async (proposalStreamID: string) => {
        try {
            // Hit mailbox server
            /*  const res = await fetch(
                `${process.env.NEXT_PUBLIC_TRILOBOT}/requestChange`,
                {
                    method: 'POST',
                    body: proposalStreamID,
                }
            ) */

            // if (res.status === 200) {
            await this.updateProposalEntry(proposalStreamID, {
                approved: false,
                requestChange: true,
            })
            return true
            // }
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
        }
    }

    /**
     * Sets the flag approved at the templates receivedProposals[proposalStreamID] commit-entry to true.
     *
     * @param proposalStreamID StreamID
     * @auth Must be done by the template author
     *
     */
    approveProposal = async (proposalStreamID: string) => {
        try {
            // Hit mailbox server
            /*  const res = await fetch(
                `${process.env.NEXT_PUBLIC_TRILOBOT}/approveProposal`,
                {
                    method: 'POST',
                    body: proposalStreamID,
                }
            ) */
            // if (res.status === 200) {
            await this.updateProposalEntry(proposalStreamID, {
                approved: true,
                requestChange: false,
            })
            return true
            // }
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
        }
    }

    updateProposalEntry = async (
        proposalStreamID: string,
        updatedProposalEntry: ReceivedProposalPropsType
    ) => {
        const proposalDoc = await this.loadStream(proposalStreamID)

        if (!proposalDoc) throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']

        const proposalContent = proposalDoc.content as CeramicProposalModel

        const templateDoc = await this.loadStream(
            proposalContent.template.streamID
        )

        if (!templateDoc) throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']

        const templateContent = templateDoc.content as CeramicTemplateModel

        const updatedReceivedProposals = _.cloneDeep(
            templateContent.receivedProposals
        )

        const proposalSubmissions = updatedReceivedProposals[proposalStreamID]

        if (!proposalSubmissions || proposalSubmissions.length === 0)
            throw Error('No Submissions found for provided Proposal StreamID.')

        // Doesn't hurt checking
        if (
            !proposalSubmissions[proposalSubmissions.length - 1] ||
            proposalSubmissions[proposalSubmissions.length - 1]
                .proposalCommitID !== proposalDoc.commitId.toString()
        )
            throw Error(
                'Provided Proposal commitID does not match with the most recent submission.'
            )

        proposalSubmissions[proposalSubmissions.length - 1] = {
            proposalCommitID: proposalDoc.commitId.toString(),
            ...updatedProposalEntry,
        }

        templateDoc.update({
            ...templateContent,
            receivedProposals: updatedReceivedProposals,
        })
    }
}
