import {
    CeramicTemplateModel,
    ReceivedProposalPropsType,
} from '@cambrian/app/models/TemplateModel'

import { CeramicProposalModel } from '@cambrian/app/models/ProposalModel'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { FlexInputFormType } from '../ui/templates/forms/TemplateFlexInputsForm'
import { GENERAL_ERROR } from '@cambrian/app/constants/ErrorMessages'
import { ProposalStackType } from './../store/ProposalContext'
import ProposalsHub from '../hubs/ProposalsHub'
import { ReceivedProposalsHashmapType } from './../models/TemplateModel'
import { SelfID } from '@self.id/framework'
import { StringHashmap } from '@cambrian/app/models/UtilityModels'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { UserType } from '../store/UserContext'
import _ from 'lodash'
import { cpLogger } from '../services/api/Logger.api'
import initialComposer from '../store/composer/composer.init'
import { mergeFlexIntoComposition } from '../utils/transformers/Composition'
import { parseComposerSolvers } from '../utils/transformers/ComposerTransformer'
import { ethers } from 'ethers'

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
            isSubmitted: false,
        }

        return await this.createStage(tag, proposal, StageNames.proposal)
    }

    deploySolutionBase = async (
        currentUser: UserType,
        proposalStack: ProposalStackType
    ) => {
        const parsedSolvers = await this.getParsedSolvers(
            proposalStack,
            currentUser
        )

        if (parsedSolvers) {
            // Pin solverConfigs separately to have access without metaData from Solution
            const solverConfigsDoc = await TileDocument.deterministic(
                this.selfID.client.ceramic,
                {
                    controllers: [this.selfID.id],
                    family: `cambrian-solverConfigs`,
                    tags: [proposalStack.proposalDoc.commitId.toString()],
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
                    tags: [proposalStack.proposalDoc.commitId.toString()],
                },
                { pin: true }
            )

            const proposalsHub = new ProposalsHub(
                currentUser.signer,
                currentUser.chainId
            )

            const solutionSafeBaseId: string = await this.getSolutionSafeBaseId(
                currentUser,
                proposalStack
            )

            const transaction = await proposalsHub.createProposal(
                parsedSolvers[0].collateralToken,
                proposalStack.proposalDoc.content.price.amount,
                solutionSafeBaseId,
                parsedSolvers.map((solver) => solver.config),
                proposalStack.proposalDoc.commitId.toString()
            )
            let rc = await transaction.wait()
            const event = rc.events?.find(
                (event) => event.event === 'CreateProposal'
            )
            const proposalId = event?.args && event.args.id
        }
    }

    deployProposal = async (
        currentUser: UserType,
        proposalStack: ProposalStackType
    ) => {
        const parsedSolvers = await this.getParsedSolvers(
            proposalStack,
            currentUser
        )

        if (parsedSolvers) {
            // Pin solverConfigs separately to have access without metaData from Solution
            const solverConfigsDoc = await TileDocument.deterministic(
                this.selfID.client.ceramic,
                {
                    controllers: [this.selfID.id],
                    family: `cambrian-solverConfigs`,
                    tags: [proposalStack.proposalDoc.commitId.toString()],
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
                    tags: [proposalStack.proposalDoc.commitId.toString()],
                },
                { pin: true }
            )

            const proposalsHub = new ProposalsHub(
                currentUser.signer,
                currentUser.chainId
            )

            const solutionSafeBaseId: string = await this.getSolutionSafeBaseId(
                currentUser,
                proposalStack
            )

            const transaction = await proposalsHub.createProposal(
                parsedSolvers[0].collateralToken,
                proposalStack.proposalDoc.content.price.amount,
                solutionSafeBaseId,
                parsedSolvers.map((solver) => solver.config),
                proposalStack.proposalDoc.commitId.toString()
            )
            let rc = await transaction.wait()
            const event = rc.events?.find(
                (event) => event.event === 'CreateProposal'
            )
            const proposalId = event?.args && event.args.id
        }
    }

    getSolutionBaseId = (proposalStack: ProposalStackType) => {
        return ethers.utils.keccak256(
            ethers.utils.defaultAbiCoder.encode(
                ['string', 'string'],
                [
                    proposalStack.templateDoc.commitId.toString(),
                    proposalStack.proposalDoc.commitId.toString(),
                ]
            )
        )
    }

    getSolutionSafeBaseId = async (
        currentUser: UserType,
        proposalStack: ProposalStackType
    ) => {
        const baseId = this.getSolutionBaseId(proposalStack)

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
            const res = await fetch(
                `http://trilobot.cambrianprotocol.com:4242/proposeDraft`,
                {
                    method: 'POST',
                    body: proposalStreamID,
                }
            )

            if (res.status === 200) {
                const proposalDoc = await TileDocument.load(
                    this.selfID.client.ceramic,
                    proposalStreamID
                )
                await proposalDoc.update({
                    ...(proposalDoc.content as CeramicProposalModel),
                    submitted: true,
                })
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
                proposalStack.compositionDoc.content,
                proposalStack.templateDoc.content.flexInputs
            ),
            proposalStack.proposalDoc.content.flexInputs
        )

        if (proposalStack.templateDoc.content.price.isCollateralFlex) {
            _compositionWithFlexInputs.solvers.forEach((solver) => {
                solver.config.collateralToken =
                    proposalStack.proposalDoc.content.price.tokenAddress
            })
        }

        const _parsedSolvers = await parseComposerSolvers(
            _compositionWithFlexInputs.solvers,
            currentUser.web3Provider
        )

        return _parsedSolvers
    }

    loadProposalStack = async (proposalStreamOrCommitID: string) => {
        const _proposalDoc = (await this.loadStream(
            proposalStreamOrCommitID
        )) as TileDocument<CeramicProposalModel>

        const _templateDoc = (await this.loadStream(
            _proposalDoc.content.template.commitID
        )) as TileDocument<CeramicTemplateModel>

        const _compositionDoc = (await this.loadStream(
            _templateDoc.content.composition.commitID
        )) as TileDocument<CompositionModel>

        return {
            proposalDoc: _proposalDoc,
            templateDoc: _templateDoc,
            compositionDoc: _compositionDoc,
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
            const res = await fetch(
                `http://trilobot.cambrianprotocol.com:4242/requestChange`,
                {
                    method: 'POST',
                    body: proposalStreamID,
                }
            )

            if (res.status === 200) {
                await this.updateProposalEntry(proposalStreamID, {
                    requestChange: true,
                })
                return true
            }
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
        }
    }

    /**
     * Sets the flag approved at the templates receivedProposals[proposalStreamID] commit-entry to true and hits Trilobots approveProposal endpoint.
     *
     * @param proposalStreamID StreamID to flag the Proposal Commit at the template as approved
     * @auth Must be done by the template author
     *
     */
    approveProposal = async (proposalStreamID: string) => {
        try {
            // Hit mailbox server
            const res = await fetch(
                `http://trilobot.cambrianprotocol.com:4242/approveProposal`,
                {
                    method: 'POST',
                    body: proposalStreamID,
                }
            )
            if (res.status === 200) {
                await this.updateProposalEntry(proposalStreamID, {
                    approved: true,
                })
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
     * @param templateDoc
     * @param proposalDoc
     * @auth Must be done by the templater
     */
    registerNewProposalSubmission = async (
        proposalDoc: TileDocument<CeramicProposalModel>,
        templateDoc: TileDocument<CeramicTemplateModel>
    ) => {
        try {
            let updatedReceivedProposals: ReceivedProposalsHashmapType = {}
            if (templateDoc.content.receivedProposals) {
                updatedReceivedProposals = _.cloneDeep(
                    templateDoc.content.receivedProposals
                )
            }

            updatedReceivedProposals[proposalDoc.id.toString()] = [
                {
                    proposalCommitID: proposalDoc.commitId.toString(),
                },
            ]
            await templateDoc.update(
                {
                    ...templateDoc.content,
                    receivedProposals: updatedReceivedProposals,
                },
                undefined,
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
        proposalStreamID: string,
        updatedProposalEntry: ReceivedProposalPropsType
    ) => {
        // Load Proposal
        const proposalDoc = await this.loadStream(proposalStreamID)
        if (!proposalDoc) throw GENERAL_ERROR['CERAMIC_LOAD_ERROR']
        const proposalContent = proposalDoc.content as CeramicProposalModel

        // Load Template
        const templateDoc = await this.loadStream(
            proposalContent.template.streamID
        )
        if (!templateDoc) throw GENERAL_ERROR['CERAMIC_LOAD_ERROR']
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

        templateDoc.update(
            {
                ...templateContent,
                receivedProposals: updatedReceivedProposals,
            },
            undefined,
            { pin: true }
        )
    }
}

// TODO WIP
// deployProposal = async (
//     proposalStreamID: string,
//     proposalCommitID: string,
//     ceramicTemplate: CeramicTemplateModel,
//     ceramicProposal: CeramicProposalModel,
//     currentUser: UserType
// ) => {
//     // Sanity check - Just let deploy if the proposalCommitID is actually flaggeed as approved at the template and the proposalCommitID is right
//     const _templateStreamContent = (await (
//         await this.loadStream(ceramicProposal.template.streamID)
//     ).content) as CeramicTemplateModel
//     const _proposalStreamEntry =
//         _templateStreamContent.receivedProposals[proposalStreamID]
//     if (
//         !_proposalStreamEntry ||
//         !_proposalStreamEntry[_proposalStreamEntry.length - 1].approved ||
//         _proposalStreamEntry[_proposalStreamEntry.length - 1].approved ===
//             undefined ||
//         _proposalStreamEntry[_proposalStreamEntry.length - 1]
//             .proposalCommitID !== proposalCommitID
//     ) {
//         throw Error(
//             'Error, commit ID of Proposal is not approved or does not match!'
//         )
//     }

//     try {
//         const parsedSolvers = await this.getParsedSolvers(
//             proposalCommitID,
//             currentUser
//         )

//         if (parsedSolvers) {
//             // Pin solverConfigs separately to have access without metaData from Solution
//             const solverConfigsDoc = await TileDocument.deterministic(
//                 this.selfID.client.ceramic,
//                 {
//                     controllers: [this.selfID.id],
//                     family: `cambrian-solverConfigs`,
//                     tags: [proposalCommitID],
//                 }
//             )

//             const proposalsHub = new ProposalsHub(
//                 currentUser.signer,
//                 currentUser.chainId
//             )

//             const transaction =
//                 await proposalsHub.createSolutionAndProposal(
//                     parsedSolvers[0].collateralToken,
//                     ceramicProposal.price.amount,
//                     parsedSolvers.map((solver) => solver.config),
//                     solverConfigsDoc.commitId.toString(),
//                     proposalCommitID
//                 )
//             let rc = await transaction.wait()
//             const event = rc.events?.find(
//                 (event) => event.event === 'CreateProposal'
//             )
//             const proposalId = event?.args && event.args.id

//             // Attach proposalID either to the template or the proposal
//             if (this.selfID.did.id === ceramicTemplate.author) {
//                 // Deployed by template author, proposalID will be attached to the template at receivedProposals
//                 await this.updateProposalEntry(proposalStreamID, {
//                     proposalID: proposalId,
//                     approved: true,
//                 })
//             } else if (this.selfID.did.id === ceramicProposal.author) {
//                 // Deloyed by proposal author, proposalID will be attached to proposal
//                 await this.updateStage(
//                     proposalStreamID,
//                     { ...ceramicProposal, proposalID: proposalId },
//                     StageNames.proposal
//                 )
//             } else {
//                 // Just in case
//                 console.warn(
//                     'Proposal was not deployed by the template or proposal creator. Created Proposal ID can not be stored!',
//                     proposalId
//                 )
//             }
//         }
//     } catch (e) {
//         cpLogger.push(e)
//         throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
//     }
// }
