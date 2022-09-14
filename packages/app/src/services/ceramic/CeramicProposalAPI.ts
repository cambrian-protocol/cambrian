import { archiveStage, ceramicInstance, createStage } from './CeramicUtils'

import { GENERAL_ERROR } from '../../constants/ErrorMessages'
import { ProposalModel } from '@cambrian/app/models/ProposalModel'
import { StageNames } from '../../models/StageModel'
import { TRILOBOT_ENDPOINT } from 'packages/app/config'
import { TemplateModel } from '../../models/TemplateModel'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { UserType } from '@cambrian/app/store/UserContext'
import _ from 'lodash'
import { cpLogger } from '../api/Logger.api'

/** 
 API functions to maintain proposals and the users proposal-lib. 
*/
export default class CeramicProposalAPI {
    user: UserType

    constructor(currentUser: UserType) {
        this.user = currentUser
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
            const templateStreamDoc: TileDocument<TemplateModel> =
                await ceramicInstance(this.user).loadStream(templateStreamID)

            const proposal: ProposalModel = {
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
                ).loadStream(proposalStreamID)) as TileDocument<ProposalModel>

                await proposalStreamDoc.update(
                    {
                        ...(proposalStreamDoc.content as ProposalModel),
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
     * Removes proposal from proposal-lib doc, and either sets the deleted flag or adds it to the proposal-archive.
     *
     * @param tag Proposal title / Unique tag
     * @param type 'CANCEL' or 'ARCHIVE' (Before approval proposal can be safely deleted, after approval proposal must be archived)
     * @auth Done by proposer
     */
    removeProposal = async (
        tag: string,
        proposalStreamID: string,
        type: 'CANCEL' | 'ARCHIVE'
    ) => {
        try {
            if (type === 'CANCEL') {
                // Add isCanceled flag to proposal
                const proposalDoc = (await TileDocument.load(
                    ceramicInstance(this.user),
                    proposalStreamID
                )) as TileDocument<ProposalModel>

                await proposalDoc.update({
                    ...proposalDoc.content,
                    isCanceled: true,
                })
            }

            await archiveStage(this.user, tag, StageNames.proposal)
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
        /*  try {
            const proposalLib = await loadStageLib<StageLibType>(
                this.user,
                StageNames.proposal
            )

            const updatedProposalLib = {
                ...proposalLib.content,
            }

            const proposalDoc = await loadStageDoc<ProposalModel>(
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
        } */
    }
}
