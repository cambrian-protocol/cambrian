import { SelfID } from '@self.id/framework'
import CeramicStagehand from './CeramicStagehand'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { cpLogger } from '../services/api/Logger.api'
import { GENERAL_ERROR } from '../constants/ErrorMessages'
import { CeramicProposalModel } from '../models/ProposalModel'

export type MessageArray = Message[]

export type Message = {
    text: string
    images?: string[]
    author: {
        name: string
        pfp?: string
    }
    timestamp: number
}

/**
 * Messages are stored for a user in:
 *
 * TileDocument.deterministic(<client>, {
 *  controllers: [<selfID>],
 *  family: "cambrian-chat"
 *  tags: [<chatID>]
 * })
 *
 * Where <chatID> is:
 *
 *  Active Solver => <solverAddress>
 *  Draft Proposal => <proposalStreamID>  (ID of PROPOSER'S stream, not recipient's copy)
 *  On-Chain Proposal => <proposalId>
 */

export default class Messenger {
    selfID: SelfID
    stagehand: CeramicStagehand

    constructor(selfID: SelfID) {
        this.selfID = selfID
        this.stagehand = new CeramicStagehand(this.selfID)
    }

    sendMessage = async (chatID: string, message: Message) => {
        try {
            const messages = await TileDocument.deterministic(
                this.selfID.client.ceramic,
                {
                    controllers: [this.selfID.id],
                    family: 'cambrian-chat',
                    tags: [chatID],
                },
                { pin: true }
            )

            await messages.patch([{ op: 'add', path: '/-', value: message }])
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
        }
    }

    /**
     * @notice Loads an array of message streams from TileDocument<CeramicProposalModel>
     * @param proposalDoc
     */
    loadChatFromDraftProposal = async (
        proposalDoc: TileDocument<CeramicProposalModel>
    ) => {
        try {
            // Load, then filter out streams that failed to load & streams with no messages
            const messagesDocs: TileDocument<MessageArray>[] = (
                (
                    await Promise.allSettled(
                        proposalDoc.content.authors.map((DID) =>
                            TileDocument.deterministic(
                                this.selfID.client.ceramic,
                                {
                                    controllers: [DID],
                                    family: 'cambrian-chat',
                                    tags: [proposalDoc.id.toString()],
                                }
                            )
                        )
                    )
                )
                    .map((res) => res.status === 'fulfilled' && res.value)
                    .filter(Boolean) as TileDocument<MessageArray>[]
            ).filter((doc) => doc.content.length > 0)

            // Get message content
            const messages: MessageArray[] = messagesDocs.map(
                (doc) => doc.content
            )

            return this.mergeMessages(messages)
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_LOAD_ERROR']
        }
    }

    /**
     * @notice Merge separate arrays of messages into one sorted list
     */
    mergeMessages = async (messages: MessageArray[]) => {
        const mergedMessages = messages
            .reduce((prev, next) => prev.concat(next)) // Array arrays together...
            .sort((a, b) => a.timestamp - b.timestamp) /// ...and sort by timestamp

        return mergedMessages
    }
}
