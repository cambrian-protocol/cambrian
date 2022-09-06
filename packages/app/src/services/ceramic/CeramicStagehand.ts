import {
    CeramicTemplateModel,
    ReceivedProposalPropsType,
} from '@cambrian/app/models/TemplateModel'

import { CeramicProposalModel } from '@cambrian/app/models/ProposalModel'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { GENERAL_ERROR } from '@cambrian/app/constants/ErrorMessages'
import { ProposalDocsStackType } from '../../store/ProposalContext'
import { StringHashmap } from '@cambrian/app/models/UtilityModels'
import { TRILOBOT_ENDPOINT } from '../../../config/index'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { UserType } from '../../store/UserContext'
import _ from 'lodash'
import { ceramicInstance } from './CeramicUtils'
import { cpLogger } from '../api/Logger.api'
import { deploySolutionBase } from '../../utils/helpers/proposalHelper'

export enum StageNames {
    composition = 'composition',
    template = 'template',
    proposal = 'proposal',
}

export type StageLibType = {
    lib: StringHashmap
    archive: { lib: string[] }
    recents: string[]
}

export type StageModel =
    | CompositionModel
    | CeramicTemplateModel
    | CeramicProposalModel

export type Stages = {
    [key in StageNames]: StageModel
}

export const CAMBRIAN_LIB_NAME = 'cambrian-lib'

export default class CeramicStagehand {
    user: UserType

    constructor(currentUser: UserType) {
        this.user = currentUser
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
            console.log(e)
        }
    }

    /**
     * Hits mailbox server and sets requestChange flag in the template.receivedProposals to true
     *
     * @param proposalStack ReadOnly ProposalStack
     * @auth must be done by the Templater
     */
    requestProposalChange = async (proposalStack: ProposalDocsStackType) => {
        try {
            // Hit mailbox server
            const res = await fetch(`${TRILOBOT_ENDPOINT}/requestChange`, {
                method: 'POST',
                body: JSON.stringify({
                    id: proposalStack.proposalDoc.id.toString(),
                    session: this.user.session.serialize(),
                }),
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            if (res.status === 200) {
                await this.updateProposalEntry(proposalStack.proposalDoc, {
                    requestChange: true,
                })
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
     * @param proposalStack ReadOnly ProposalStack
     * @auth must be done by the Templater
     */
    approveProposal = async (
        currentUser: UserType,
        proposalStack: ProposalDocsStackType
    ) => {
        try {
            if (await deploySolutionBase(currentUser, proposalStack)) {
                // Hit mailbox server
                const res = await fetch(
                    `${TRILOBOT_ENDPOINT}/approveProposal`,
                    {
                        method: 'POST',
                        body: JSON.stringify({
                            id: proposalStack.proposalDoc.id.toString(),
                            session: this.user.session.serialize(),
                        }),
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                )
                if (res.status === 200) {
                    await this.updateProposalEntry(proposalStack.proposalDoc, {
                        approved: true,
                    })
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
        updatedProposalEntry: ReceivedProposalPropsType
    ) => {
        const templateDoc = (await ceramicInstance(this.user).loadStream(
            proposalDoc.content.template.streamID
        )) as TileDocument<CeramicTemplateModel>

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
        await templateDoc.update({
            ...templateDoc.content,
            receivedProposals: updatedReceivedProposals,
        })
        console.log('Proposal Entry at Template updated:', templateDoc)
    }

    /* ========================== DELETE =============================== */

    // Warning: Just for dev purposes to clean DID from all stages
    clearStages = async (stage: StageNames) => {
        const stageLib = await TileDocument.deterministic(
            ceramicInstance(this.user),
            {
                controllers: [this.user.did],
                family: CAMBRIAN_LIB_NAME,
                tags: [stage],
            },
            { pin: true }
        )

        stageLib.update({})
    }
}
