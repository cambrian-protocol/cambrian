import { CERAMIC_NODE_ENDPOINT, TRILOBOT_ENDPOINT } from './../../config/index'
import {
    CeramicTemplateModel,
    ReceivedProposalPropsType,
} from '@cambrian/app/models/TemplateModel'

import CeramicClient from '@ceramicnetwork/http-client'
import { CeramicProposalModel } from '@cambrian/app/models/ProposalModel'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { FlexInputFormType } from '../ui/templates/forms/TemplateFlexInputsForm'
import { GENERAL_ERROR } from '@cambrian/app/constants/ErrorMessages'
import { ProposalStackType } from '../store/ProposalContext'
import { ReceivedProposalsHashmapType } from './../models/TemplateModel'
import { SelfID } from '@self.id/framework'
import { SolverModel } from '../models/SolverModel'
import { StringHashmap } from '@cambrian/app/models/UtilityModels'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { UserType } from '../store/UserContext'
import _ from 'lodash'
import { cpLogger } from '../services/api/Logger.api'
import { deploySolutionBase } from '../utils/helpers/proposalHelper'
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

export const CAMBRIAN_LIB_NAME = 'cambrian-lib'

export default class CeramicStagehand {
    selfID: SelfID
    ceramicClient: CeramicClient

    constructor(selfID: SelfID) {
        this.selfID = selfID
        this.ceramicClient = new CeramicClient(CERAMIC_NODE_ENDPOINT)
    }

    /* ========================== CREATE =============================== */

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
            isSubmitted: false,
        }

        return await this.createStage(tag, proposal, StageNames.proposal)
    }

    createStage = async (tag: string, data: StageModel, stage: StageNames) => {
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
                },
                { pin: true }
            )
            await currentDoc.update(data)
            const streamID = currentDoc.id.toString()

            if (
                stageLib.content !== null &&
                typeof stageLib.content === 'object'
            ) {
                await stageLib.update(
                    {
                        ...stageLib.content,
                        [uniqueTag]: streamID,
                    },
                    {
                        controllers: [this.selfID.id],
                        family: CAMBRIAN_LIB_NAME,
                        tags: [stage],
                    },
                    { pin: true }
                )
            } else {
                await stageLib.update(
                    {
                        [uniqueTag]: streamID,
                    },
                    {
                        controllers: [this.selfID.id],
                        family: CAMBRIAN_LIB_NAME,
                        tags: [stage],
                    },
                    { pin: true }
                )
            }

            return { uniqueTag: uniqueTag, streamID: streamID }
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
        }
    }

    createSolverConfigs = async (
        parsedSolvers: SolverModel[],
        proposalCommitId: string
    ) => {
        try {
            const solverConfigsDoc = await TileDocument.deterministic(
                this.selfID.client.ceramic,
                {
                    controllers: [this.selfID.id],
                    family: `cambrian-solverConfigs`,
                    tags: [proposalCommitId],
                },
                { pin: true }
            )

            await solverConfigsDoc.update(
                {
                    solverConfigs: parsedSolvers.map((x) => x.config),
                },
                {
                    controllers: [this.selfID.id],
                    family: `cambrian-solverConfigs`,
                    tags: [proposalCommitId],
                },
                { pin: true }
            )

            return solverConfigsDoc
        } catch (e) {
            console.error(e)
        }
    }

    /* ========================== READ =============================== */

    loadTileDocument = async (streamID: string) => {
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

    loadReadOnlyStream = async (streamOrCommitID: string) => {
        try {
            return (await this.ceramicClient.loadStream(
                streamOrCommitID
            )) as unknown as TileDocument<unknown>
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_LOAD_ERROR']
        }
    }

    loadReadOnlyStreams = async (
        queries: { streamId: string }[]
    ): Promise<any> => {
        try {
            const streamMap = await this.ceramicClient.multiQuery(queries)
            return streamMap
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_LOAD_ERROR']
        }
    }

    loadStagesMap = async (stage: StageNames) => {
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

    loadProposalStackFromID = async (proposalCommitOrStreamID: string) => {
        const proposalDoc = (await this.ceramicClient.loadStream(
            proposalCommitOrStreamID
        )) as unknown as TileDocument<CeramicProposalModel>

        return this.loadProposalStackFromProposal(proposalDoc)
    }

    loadProposalStackFromProposal = async (
        proposalDoc: TileDocument<CeramicProposalModel>
    ): Promise<ProposalStackType> => {
        const templateDoc = (await this.ceramicClient.loadStream(
            proposalDoc.content.template.commitID
        )) as unknown as TileDocument<CeramicTemplateModel>

        const compositionDoc = (await this.ceramicClient.loadStream(
            templateDoc.content.composition.commitID
        )) as unknown as TileDocument<CompositionModel>

        return {
            proposalDoc: proposalDoc,
            templateDoc: templateDoc,
            compositionDoc: compositionDoc,
        }
    }

    /* ========================== UPDATE =============================== */

    /**
     * Hits mailbox server and submits the proposal / sets the isSubmitted flag to true
     *
     * @auth Must be done by the proposer
     */
    submitProposal = async (
        proposalStreamDoc: TileDocument<CeramicProposalModel>
    ) => {
        try {
            // Hit mailbox server
            const res = await fetch(`${TRILOBOT_ENDPOINT}/proposeDraft`, {
                method: 'POST',
                body: JSON.stringify({ id: proposalStreamDoc.id.toString() }),
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            if (res.status === 200) {
                await proposalStreamDoc.update(
                    {
                        ...(proposalStreamDoc.content as CeramicProposalModel),
                        isSubmitted: true,
                    },
                    { ...proposalStreamDoc.metadata },
                    { pin: true }
                )
                return true
            } else {
                cpLogger.push(res.status)
                return false
            }
        } catch (e) {
            console.log(e)
        }
    }

    /**
     * Adds a new entry for a submitted proposal at the templates receivedProposals
     *
     * @auth Must be done by the templater
     */
    registerNewProposalSubmission = async (
        proposalStreamDoc: TileDocument<CeramicProposalModel>,
        templateStreamDoc: TileDocument<CeramicTemplateModel>
    ) => {
        try {
            let updatedReceivedProposals: ReceivedProposalsHashmapType = {}
            if (templateStreamDoc.content.receivedProposals) {
                updatedReceivedProposals = _.cloneDeep(
                    templateStreamDoc.content.receivedProposals
                )
            }

            const proposalStreamID = proposalStreamDoc.id.toString()
            const proposalCommmitID = proposalStreamDoc.commitId.toString()

            if (!updatedReceivedProposals[proposalStreamID]) {
                updatedReceivedProposals[proposalStreamID] = [
                    {
                        proposalCommitID: proposalCommmitID,
                    },
                ]
            } else {
                updatedReceivedProposals[proposalStreamID].push({
                    proposalCommitID: proposalCommmitID,
                })
            }

            await templateStreamDoc.update(
                {
                    ...templateStreamDoc.content,
                    receivedProposals: updatedReceivedProposals,
                },
                { ...templateStreamDoc.metadata },
                { pin: true }
            )
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
        }
    }

    /**
     * Hits mailbox server and sets requestChange flag in the template.receivedProposals to true
     *
     * @param templateStreamDoc TemplateStream Tiledoc controlled by the Templater
     * @param proposalStack ReadOnly ProposalStack
     * @auth must be done by the Templater
     */
    requestProposalChange = async (
        templateStreamDoc: TileDocument<CeramicTemplateModel>,
        proposalStack: ProposalStackType
    ) => {
        try {
            // Hit mailbox server
            const res = await fetch(`${TRILOBOT_ENDPOINT}/requestChange`, {
                method: 'POST',
                body: JSON.stringify({
                    id: proposalStack.proposalDoc.id.toString(),
                }),
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            if (res.status === 200) {
                await this.updateProposalEntry(
                    proposalStack.proposalDoc,
                    templateStreamDoc,
                    {
                        requestChange: true,
                    }
                )
                return true
            } else {
                cpLogger.push(res.status)
                return false
            }
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
        }
    }

    /**
     * Deploys a SolutionBase from the ProposalCommitID and the TemplateCommitID, hits mailbox server and sets the approved flag in the template.receivedProposals to true
     *
     * @param currentUser
     * @param templateStreamDoc TemplateStream Tiledoc controlled by the Templater
     * @param proposalStack ReadOnly ProposalStack
     * @auth must be done by the Templater
     */
    approveProposal = async (
        currentUser: UserType,
        templateStreamDoc: TileDocument<CeramicTemplateModel>,
        proposalStack: ProposalStackType
    ) => {
        try {
            const success = await deploySolutionBase(
                currentUser,
                proposalStack,
                this
            )

            if (success) {
                // Archive Proposal & Send Mail
                const res = await fetch(
                    `${TRILOBOT_ENDPOINT}/approveProposal`,
                    {
                        method: 'POST',
                        body: JSON.stringify({
                            id: proposalStack.proposalDoc.id.toString(),
                        }),
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                )
                if (res.status === 200) {
                    await this.updateProposalEntry(
                        proposalStack.proposalDoc,
                        templateStreamDoc,
                        {
                            approved: true,
                        }
                    )
                    return true
                } else {
                    cpLogger.push(res.status)
                    return false
                }
            }
        } catch (e) {
            throw e
        }
    }

    /**
     * Updates the templates receivedProposals[proposalStreamID] commit-entry.
     *
     * @auth Must be done by the templater
     */
    updateProposalEntry = async (
        proposalDoc: TileDocument<CeramicProposalModel>,
        templateDoc: TileDocument<CeramicTemplateModel>,
        updatedProposalEntry: ReceivedProposalPropsType
    ) => {
        const updatedReceivedProposals = _.cloneDeep(
            templateDoc.content.receivedProposals
        )

        const proposalSubmissions =
            updatedReceivedProposals[proposalDoc.id.toString()]
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
        templateDoc.update(
            {
                ...templateDoc.content,
                receivedProposals: updatedReceivedProposals,
            },
            undefined,
            { pin: true }
        )
    }

    updateStage = async (
        streamID: string,
        data: StageModel,
        stage: StageNames
    ) => {
        try {
            const currentData: TileDocument<StageModel> =
                await TileDocument.load(this.selfID.client.ceramic, streamID)

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

                await stageLib.update(updatedStageLib, undefined, { pin: true })
                await currentData.update(
                    { ...data, title: uniqueTag },
                    { ...currentData.metadata, tags: [uniqueTag] },
                    { pin: true }
                )
                return { uniqueTag: uniqueTag }
            } else {
                await currentData.update(
                    { ...data, title: cleanedUserTitle },
                    undefined,
                    { pin: true }
                )
                return { uniqueTag: cleanedUserTitle }
            }
        } catch (e) {
            throw e
        }
    }

    /* ========================== DELETE =============================== */

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

    // Warning: Just for dev purposes to clean DID from all stages
    clearStages = async (stage: StageNames) => {
        const stageLib = await TileDocument.deterministic(
            this.selfID.client.ceramic,
            {
                controllers: [this.selfID.id],
                family: CAMBRIAN_LIB_NAME,
                tags: [stage],
            },
            { pin: true }
        )

        stageLib.update({})
    }
}
