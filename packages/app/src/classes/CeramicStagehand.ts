import {
    CeramicTemplateModel,
    ReceivedProposalPropsType,
} from '@cambrian/app/models/TemplateModel'

import { CERAMIC_NODE_ENDPOINT } from './../../config/index'
import CeramicClient from '@ceramicnetwork/http-client'
import { CeramicProposalModel } from '@cambrian/app/models/ProposalModel'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { FlexInputFormType } from '../ui/templates/forms/TemplateFlexInputsForm'
import { GENERAL_ERROR } from '@cambrian/app/constants/ErrorMessages'
import IPFSSolutionsHub from '../hubs/IPFSSolutionsHub'
import { ProposalStackType } from '../store/ProposalContext'
import ProposalsHub from '../hubs/ProposalsHub'
import { ReceivedProposalsHashmapType } from './../models/TemplateModel'
import { SelfID } from '@self.id/framework'
import { SolverModel } from '../models/SolverModel'
import { StringHashmap } from '@cambrian/app/models/UtilityModels'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { UserType } from '../store/UserContext'
import _ from 'lodash'
import { cpLogger } from '../services/api/Logger.api'
import { ethers } from 'ethers'
import initialComposer from '../store/composer/composer.init'
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
    ceramicClient: CeramicClient

    constructor(selfID: SelfID) {
        this.selfID = selfID
        this.ceramicClient = new CeramicClient(CERAMIC_NODE_ENDPOINT)
    }

    // TODO
    isStageSchema = (data: StageModel, stage: StageNames) => {
        return true
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

    saveSolverConfigs = async (
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

    approveProposal = async (
        currentUser: UserType,
        proposalStreamDoc: TileDocument<CeramicProposalModel>,
        templateStreamDoc: TileDocument<CeramicTemplateModel>,
        proposalStack: ProposalStackType
    ) => {
        try {
            const success = await this.deploySolutionBase(
                currentUser,
                proposalStreamDoc,
                proposalStack
            )

            if (success) {
                // Hit mailbox server
                const res = await fetch(
                    `http://trilobot.cambrianprotocol.com:4242/approveProposal`,
                    {
                        method: 'POST',
                        body: proposalStreamDoc.id.toString(),
                    }
                )
                if (res.status === 200) {
                    await this.updateProposalEntry(
                        proposalStreamDoc,
                        templateStreamDoc,
                        {
                            approved: true,
                        }
                    )
                    return true
                }
            }
        } catch (e) {
            throw e
        }
    }

    deploySolutionBase = async (
        currentUser: UserType,
        proposalStreamDoc: TileDocument<CeramicProposalModel>,
        proposalStack: ProposalStackType
    ) => {
        try {
            const parsedSolvers = await this.getParsedSolvers(
                proposalStack,
                currentUser
            )

            if (parsedSolvers) {
                // Pin solverConfigs separately to have access without metaData from Solution
                const solverConfigsDoc = await this.saveSolverConfigs(
                    parsedSolvers,
                    proposalStreamDoc.commitId.toString()
                )

                if (!solverConfigsDoc)
                    throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']

                const solutionsHub = new IPFSSolutionsHub(
                    currentUser.signer,
                    currentUser.chainId
                )

                const solutionBaseId: string = this.getSolutionBaseId(
                    proposalStreamDoc.commitId.toString(),
                    proposalStack.proposal.template.commitID
                )

                const transaction = await solutionsHub.createBase(
                    solutionBaseId,
                    parsedSolvers[0].collateralToken.address,
                    parsedSolvers.map((solver) => solver.config),
                    solverConfigsDoc.commitId.toString()
                )
                let rc = await transaction.wait()
                const event = rc.events?.find(
                    (event) => event.event === 'CreateBase'
                )
                if (event) return true
            }
        } catch (e) {
            throw e
        }
    }

    deployProposal = async (
        currentUser: UserType,
        proposalStreamDoc: TileDocument<CeramicProposalModel>,
        proposalStack: ProposalStackType
    ) => {
        // TODO Sanity check function that this is approved
        const parsedSolvers = await this.getParsedSolvers(
            proposalStack,
            currentUser
        )

        if (parsedSolvers) {
            // Pin solverConfigs separately to have access without metaData from Solution
            // URI will differ from that on the Solution Base, but it should refer to identical data
            const solverConfigsDoc = await this.saveSolverConfigs(
                parsedSolvers,
                proposalStreamDoc.commitId.toString()
            )

            if (!solverConfigsDoc) throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']

            const proposalsHub = new ProposalsHub(
                currentUser.signer,
                currentUser.chainId
            )

            const solutionSafeBaseId: string = await this.getSolutionSafeBaseId(
                proposalStreamDoc.commitId.toString(),
                proposalStack.proposal.template.commitID
            )

            const transaction = await proposalsHub.createProposal(
                parsedSolvers[0].collateralToken,
                proposalStreamDoc.content.price.amount,
                solutionSafeBaseId,
                parsedSolvers.map((solver) => solver.config),
                proposalStreamDoc.commitId.toString()
            )
            let rc = await transaction.wait()
            const event = rc.events?.find(
                (event) => event.event === 'CreateProposal'
            )
            console.log(event)
            if (!event) throw GENERAL_ERROR['PROPOSAL_DEPLOY_ERROR']

            // If for some reason some POS wants to DOS we can save the correct id nonce
            // on ceramic to save time for subsequent loads
        }
    }

    getSolutionBaseId = (
        proposalCommitID: string,
        templateCommitID: string
    ) => {
        return ethers.utils.keccak256(
            ethers.utils.defaultAbiCoder.encode(
                ['string', 'string'],
                [templateCommitID, proposalCommitID]
            )
        )
    }

    getSolutionSafeBaseId = async (
        proposalCommitID: string,
        templateCommitID: string
    ) => {
        const baseId = this.getSolutionBaseId(
            proposalCommitID,
            templateCommitID
        )

        let nonce = 1 // Default nonce is 1

        /**
         * TODO
         * To protect against DOS caused by a proposal being created ahead of our real users,
         * a nonce is incremented on-chain.
         *
         * This is where we would fetch the IPFSSolutionsHub.bases[baseId] and check if it's contents are
         * what we expect. If they aren't, we can increment the nonce until we find the Base made by a
         * legitimate user.
         *
         * We can do a similar procedure later when fetching proposals from on-chain.
         *
         */

        return ethers.utils.keccak256(
            ethers.utils.defaultAbiCoder.encode(
                ['bytes32', 'uint256'],
                [baseId, nonce]
            )
        )
    }

    getOnChainProposalId = async (
        proposalCommitID: string,
        templateCommitID: string
    ) => {
        const solutionSafeBaseId = await this.getSolutionSafeBaseId(
            proposalCommitID,
            templateCommitID
        )
        let nonce = 1
        // TODO Same idea as above. Somebody may have front-ran the proposalId we expected
        // We can fetch a proposal starting at nonce = 1, check if its what we expect..
        // If it's not, increment nonce until it is
        // We're not worrying about this right now

        return ethers.utils.keccak256(
            ethers.utils.defaultAbiCoder.encode(
                ['bytes32', 'string', 'uint256'],
                [solutionSafeBaseId, proposalCommitID, nonce]
            )
        )
    }

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

    loadStreamContent = async (streamOrCommitID: string) => {
        try {
            const streamContent = await (
                await this.ceramicClient.loadStream(streamOrCommitID)
            ).content

            return streamContent
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

    submitProposal = async (
        proposalStreamDoc: TileDocument<CeramicProposalModel>
    ) => {
        try {
            // Hit mailbox server
            const res = await fetch(
                `http://trilobot.cambrianprotocol.com:4242/proposeDraft`,
                {
                    method: 'POST',
                    body: proposalStreamDoc.id.toString(),
                }
            )

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
            }
        } catch (e) {
            console.log(e)
        }
    }

    getParsedSolvers = async (
        proposalStack: ProposalStackType,
        currentUser: UserType
    ) => {
        const _compositionWithFlexInputs = mergeFlexIntoComposition(
            mergeFlexIntoComposition(
                proposalStack.composition,
                proposalStack.template.flexInputs
            ),
            proposalStack.proposal.flexInputs
        )

        if (proposalStack.template.price.isCollateralFlex) {
            _compositionWithFlexInputs.solvers.forEach((solver) => {
                solver.config.collateralToken =
                    proposalStack.proposal.price.tokenAddress
            })
        }

        const _parsedSolvers = await parseComposerSolvers(
            _compositionWithFlexInputs.solvers,
            currentUser.web3Provider
        )

        return _parsedSolvers
    }

    loadProposalStackFromID = async (proposalStreamOrCommitID: string) => {
        const _proposalContent = (
            await this.ceramicClient.loadStream(proposalStreamOrCommitID)
        ).content as CeramicProposalModel

        return this.loadProposalStackFromProposal(_proposalContent)
    }

    loadProposalStackFromProposal = async (
        proposalContent: CeramicProposalModel
    ) => {
        const _templateCommitContent = (
            await this.ceramicClient.loadStream(
                proposalContent.template.commitID
            )
        ).content as CeramicTemplateModel

        const _compositionCommitContent = (
            await this.ceramicClient.loadStream(
                _templateCommitContent.composition.commitID
            )
        ).content as CompositionModel

        return {
            proposal: proposalContent,
            template: _templateCommitContent,
            composition: _compositionCommitContent,
        }
    }

    requestProposalChange = async (
        proposalStreamDoc: TileDocument<CeramicProposalModel>,
        templateStreamDoc: TileDocument<CeramicTemplateModel>
    ) => {
        try {
            // Hit mailbox server
            const res = await fetch(
                `http://trilobot.cambrianprotocol.com:4242/requestChange`,
                {
                    method: 'POST',
                    body: proposalStreamDoc.id.toString(),
                }
            )

            if (res.status === 200) {
                await this.updateProposalEntry(
                    proposalStreamDoc,
                    templateStreamDoc,
                    {
                        requestChange: true,
                    }
                )
                return true
            }
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
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
     * Updates the templates receivedProposals[proposalStreamID] commit-entry.
     *
     * @param proposalStreamID StreamID
     * @param updatedProposalEntry
     * @auth Must be done by the template author
     *
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
}
