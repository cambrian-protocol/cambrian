import { StageLibType, StageNames } from '../../models/StageModel'
import {
    ceramicInstance,
    createStage,
    loadStageDoc,
    loadStageLib,
} from './CeramicUtils'

import { CeramicProposalModel } from '@cambrian/app/models/ProposalModel'
import { CeramicTemplateModel } from '../../models/TemplateModel'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { GENERAL_ERROR } from '../../constants/ErrorMessages'
import { TRILOBOT_ENDPOINT } from 'packages/app/config'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { UserType } from '@cambrian/app/store/UserContext'
import _ from 'lodash'
import { cpLogger } from '../api/Logger.api'

export type CeramicProposalLibType = StageLibType & {
    received: string[]
    archive: { received: string[] }
}

/** 
 API functions to maintain proposals and the users proposal-lib. 
*/
export default class CeramicProposalAPI {
    user: UserType

    constructor(currentUser: UserType) {
        this.user = currentUser
    }

    /**
     * Loads the corresponding TileDocuments proposal, template and composition from the passed proposalCommitOrStreamID.
     *
     * @param proposalCommitOrStreamID
     * @returns Object containing proposal-, template- and composition- TileDocuments
     */
    loadProposalStackFromID = async (proposalCommitOrStreamID: string) => {
        const cs = ceramicInstance(this.user)
        const proposalDoc = (await cs.loadStream(
            proposalCommitOrStreamID
        )) as TileDocument<CeramicProposalModel>

        const templateDoc = (await cs.loadStream(
            proposalDoc.content.template.commitID
        )) as TileDocument<CeramicTemplateModel>

        const compositionDoc = (await cs.loadStream(
            templateDoc.content.composition.commitID
        )) as TileDocument<CompositionModel>

        return {
            proposalDoc: proposalDoc,
            templateDoc: templateDoc,
            compositionDoc: compositionDoc,
        }
    }

    /**
     * Creates a proposal from the passed templateStreamID and adds it to the users proposal-lib.
     *
     * @param title
     * @param templateStreamID
     * @returns
     */
    createProposal = async (
        title: string,
        templateStreamID: string
    ): Promise<string> => {
        try {
            const templateStreamDoc: TileDocument<CeramicTemplateModel> =
                await ceramicInstance(this.user).loadStream(templateStreamID)

            const proposal: CeramicProposalModel = {
                title: title,
                description: '',
                template: {
                    streamID: templateStreamID,
                    commitID: templateStreamDoc.commitId.toString(),
                },
                flexInputs: templateStreamDoc.content.flexInputs.filter(
                    (flexInput) =>
                        flexInput.tagId !== 'collateralToken' &&
                        flexInput.value === ''
                ),
                author: this.user.did,
                price: {
                    amount: 0,
                    tokenAddress:
                        templateStreamDoc.content.price
                            .denominationTokenAddress,
                },
                isSubmitted: false,
            }

            return await createStage(proposal, StageNames.proposal, this.user)
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
        }
    }

    /**
     * Hits mailbox server and submits the proposal / sets the isSubmitted flag to true
     *
     * @auth Must be done by the proposer
     */
    submitProposal = async (proposalStreamID: string) => {
        try {
            // Hit mailbox server
            const res = await fetch(`${TRILOBOT_ENDPOINT}/proposeDraft`, {
                method: 'POST',
                body: JSON.stringify({
                    id: proposalStreamID,
                    session: this.user.session.serialize(), // Ceramic types not updated for WebClientSession yet
                }),
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            if (res.status === 200) {
                const proposalStreamDoc = (await ceramicInstance(
                    this.user
                ).loadStream(
                    proposalStreamID
                )) as TileDocument<CeramicProposalModel>

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
            cpLogger.push(e)
        }
    }

    /**
     * Pushes passed proposalStreamID to received if not already existant.
     *
     * @param proposalStreamID
     */
    addReceivedProposal = async (proposalStreamID: string) => {
        try {
            const proposalLib = await loadStageLib<CeramicProposalLibType>(
                this.user,
                StageNames.proposal
            )

            const updatedProposalLib = { ...proposalLib.content }
            if (updatedProposalLib.received) {
                // Just push if not existant
                if (
                    updatedProposalLib.received.indexOf(proposalStreamID) === -1
                ) {
                    updatedProposalLib.received.push(proposalStreamID)
                    await proposalLib.update(updatedProposalLib)
                }
            } else {
                updatedProposalLib.received = [proposalStreamID]
                await proposalLib.update(updatedProposalLib)
            }
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
        }
    }

    /**
     * Removes proposal from proposal-lib doc, and either sets the deleted flag or adds it to the proposal-archive.
     *
     * @param tag Proposal title / Unique tag
     * @param type 'DELETE' or 'ARCHIVE' (Before approval proposal can be safely deleted, after approval proposal must be archived)
     * @auth Done by proposer
     */
    removeProposal = async (tag: string, type: 'DELETE' | 'ARCHIVE') => {
        try {
            const proposalLib = await loadStageLib<CeramicProposalLibType>(
                this.user,
                StageNames.proposal
            )

            const updatedProposalLib = {
                ...proposalLib.content,
            }
            if (type === 'DELETE') {
                // Add isDeleted flag to proposal
                const proposalDoc = (await TileDocument.load(
                    ceramicInstance(this.user),
                    updatedProposalLib.lib[tag]
                )) as TileDocument<CeramicProposalModel>

                await proposalDoc.update({
                    ...proposalDoc.content,
                    isDeleted: true,
                })
            } else if (type === 'ARCHIVE') {
                if (!updatedProposalLib.archive)
                    updatedProposalLib.archive = { received: [], lib: [] }

                if (!updatedProposalLib.archive.lib)
                    updatedProposalLib.archive = {
                        ...updatedProposalLib.archive,
                        lib: [],
                    }

                updatedProposalLib.archive.lib.push(updatedProposalLib.lib[tag])
            }

            delete updatedProposalLib.lib[tag]
            await proposalLib.update({
                ...updatedProposalLib,
            })
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
        }
    }

    /***
     * Adds proposal to proposal-lib and removes it from proposal archive.
     * TODO Update title if exists
     *
     * @auth Done by Proposer
     */
    unarchiveProposal = async (proposalStreamID: string) => {
        try {
            const proposalLib = await loadStageLib<CeramicProposalLibType>(
                this.user,
                StageNames.proposal
            )

            const updatedProposalLib = {
                ...proposalLib.content,
            }

            const proposalDoc = await loadStageDoc<CeramicProposalModel>(
                this.user,
                proposalStreamID
            )

            updatedProposalLib.lib[proposalDoc.content.title] = proposalStreamID

            const updatedProposalArchive = [...updatedProposalLib.archive.lib]

            await proposalLib.update({
                ...updatedProposalLib,
                archive: {
                    ...updatedProposalLib.archive,
                    lib: updatedProposalArchive.filter(
                        (p) => p !== proposalStreamID
                    ),
                },
            })
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
        }
    }

    /***
     * Removes received proposal form proposal stage collection doc, if deleted adds declined flag to templates receivedProposalEntry, if archived just adds to archive.received
     *
     * @param type Delete or Archive (Before approval received proposal can be declined, after approval received proposal can just be archived)
     * @auth Done by Templater
     */
    removeReceivedProposal = async (
        proposalStreamID: string,
        type: 'DELETE' | 'ARCHIVE'
    ) => {
        try {
            const proposalLib = await loadStageLib<CeramicProposalLibType>(
                this.user,
                StageNames.proposal
            )

            const updatedProposalLib = {
                ...proposalLib.content,
            }
            if (type === 'DELETE') {
                // Add isDeclined flag to template
                const proposalDoc = (await ceramicInstance(
                    this.user
                ).loadStream(
                    proposalStreamID
                )) as TileDocument<CeramicProposalModel>

                const templateDoc = (await TileDocument.load(
                    ceramicInstance(this.user),
                    proposalDoc.content.template.streamID
                )) as TileDocument<CeramicTemplateModel>

                const updatedReceivedProposals = {
                    ...templateDoc.content.receivedProposals,
                }

                if (updatedReceivedProposals[proposalStreamID]) {
                    updatedReceivedProposals[proposalStreamID].push({
                        proposalCommitID: proposalDoc.commitId.toString(),
                        isDeclined: true,
                    })
                    await templateDoc.update({
                        ...templateDoc.content,
                        receivedProposals: updatedReceivedProposals,
                    })
                }
            } else if (type === 'ARCHIVE') {
                if (!updatedProposalLib.archive)
                    updatedProposalLib.archive = { received: [], lib: [] }

                if (!updatedProposalLib.archive.received)
                    updatedProposalLib.archive = {
                        ...updatedProposalLib.archive,
                        received: [],
                    }

                updatedProposalLib.archive.received.push(proposalStreamID)
            }

            await proposalLib.update({
                ...updatedProposalLib,
                received: updatedProposalLib.received.filter(
                    (r) => r !== proposalStreamID
                ),
            })
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
        }
    }

    /***
     * Adds received proposal back to received proposal collection and removes it from received archive
     * TODO Update title if exists
     *
     * @auth Done by Templater
     */
    unarchiveReceivedProposal = async (proposalStreamID: string) => {
        try {
            const proposalLib = await loadStageLib<CeramicProposalLibType>(
                this.user,
                StageNames.proposal
            )

            const updatedProposalLib = {
                ...proposalLib.content,
            }
            updatedProposalLib.received.push(proposalStreamID)

            const updatedReceivedProposalArchive = [
                ...updatedProposalLib.archive.received,
            ]

            await proposalLib.update({
                ...updatedProposalLib,
                archive: {
                    ...updatedProposalLib.archive,
                    received: updatedReceivedProposalArchive.filter(
                        (p) => p !== proposalStreamID
                    ),
                },
            })
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
        }
    }
}
