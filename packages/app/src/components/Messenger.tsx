import { useEffect, useState } from 'react'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { cpLogger } from '../services/api/Logger.api'
import { GENERAL_ERROR } from '../constants/ErrorMessages'
import { CeramicProposalModel } from '../models/ProposalModel'
import { UserType } from '../store/UserContext'
import io from 'socket.io-client'
import ChatMessage, { ChatMessageType } from '../ui/moduleUIs/Chat/ChatMessage'
import { Button } from 'grommet/components/Button'

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

export default function Messenger({
    currentUser,
    chatID,
    chatType,
    participants,
}: {
    currentUser: UserType
    chatID: string
    chatType: 'Draft' | 'Proposal' | 'Solver' | 'Other'
    participants?: string[] // For 'Other'
}) {
    const [messages, setMessages] = useState<ChatMessageType[]>([])
    const socket = io('ws://localhost:4242')

    useEffect(() => {
        socket.on(`cambrian-chat-${chatID}`, (message: ChatMessageType) => {
            console.log('Received msg')
            setMessages([...messages, message])
        })
        socket.on('connect', () => {
            console.log(`Connected client`)
        })
        socket.on('connect_error', (err) => {
            console.log(`connect_error due to ${err.message}`)
        })

        return () => {
            socket.disconnect()
        }
    }, [])

    useEffect(() => {
        loadChat()
    }, [])

    const loadChat = async () => {
        let msgs
        switch (chatType) {
            case 'Draft':
                msgs = await loadChatDraftProposal()
                setMessages(msgs)
            case 'Other':
                msgs = await loadChatOther()
                setMessages(msgs)
        }
    }

    const sendMessage = async (message: ChatMessageType) => {
        try {
            setMessages([...messages, message])

            socket.emit(`sendMessage`, {
                chatID: chatID,
                message: message,
            })

            const messagesDoc = await TileDocument.deterministic(
                currentUser.selfID.client.ceramic,
                {
                    controllers: [currentUser.selfID.id],
                    family: 'cambrian-chat',
                    tags: [chatID],
                },
                { pin: true }
            )

            if (Array.isArray(messagesDoc.content)) {
                await messagesDoc.update([...messagesDoc.content, message])
            } else {
                await messagesDoc.update([message])
            }

            console.log(messagesDoc)
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
        }
    }

    const loadChatOther = async () => {
        console.log('Loading chat other')
        try {
            // Load, then filter out streams that failed to load & streams with no messages
            const messagesDocs: TileDocument<ChatMessageType[]>[] = (
                (
                    await Promise.allSettled(
                        participants!.map((DID) =>
                            TileDocument.deterministic(
                                currentUser.selfID.client.ceramic,
                                {
                                    controllers: [DID],
                                    family: 'cambrian-chat',
                                    tags: [chatID],
                                }
                            )
                        )
                    )
                )
                    .map((res) => {
                        console.log(res)
                        return res.status === 'fulfilled' && res.value
                    })
                    .filter(Boolean) as TileDocument<ChatMessageType[]>[]
            ).filter((doc) => doc.content.length > 0)

            console.log(messagesDocs)

            // Get message content
            const messages: ChatMessageType[][] = messagesDocs.map(
                (doc) => doc.content
            )

            return mergeMessages(messages)
        } catch (e) {
            console.log(e)
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_LOAD_ERROR']
        }
    }

    /**
     * @notice Loads an array of message streams from TileDocument<CeramicProposalModel>
     * @dev chatID == proposalID of draft
     */
    const loadChatDraftProposal = async () => {
        try {
            const proposalDoc: TileDocument<CeramicProposalModel> =
                await TileDocument.deterministic(
                    currentUser.selfID.client.ceramic,
                    {
                        controllers: [currentUser.selfID.id],
                        family: 'cambrian-proposal',
                        tags: [chatID],
                    }
                )

            // Load, then filter out streams that failed to load & streams with no messages
            const messagesDocs: TileDocument<ChatMessageType[]>[] = (
                (
                    await Promise.allSettled(
                        proposalDoc.content.authors.map((DID) =>
                            TileDocument.deterministic(
                                currentUser.selfID.client.ceramic,
                                {
                                    controllers: [DID],
                                    family: 'cambrian-chat',
                                    tags: [chatID],
                                }
                            )
                        )
                    )
                )
                    .map((res) => res.status === 'fulfilled' && res.value)
                    .filter(Boolean) as TileDocument<ChatMessageType[]>[]
            ).filter((doc) => doc.content.length > 0)

            // Get message content
            const messages: ChatMessageType[][] = messagesDocs.map(
                (doc) => doc.content
            )

            return mergeMessages(messages)
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_LOAD_ERROR']
        }
    }

    /**
     * @notice Merge separate arrays of messages into one sorted list
     */
    const mergeMessages = async (messages: ChatMessageType[][]) => {
        const mergedMessages = messages
            .reduce((prev, next) => prev.concat(next), []) // Array arrays together...
            .sort((a, b) => a.timestamp - b.timestamp) /// ...and sort by timestamp

        return mergedMessages
    }

    return (
        <>
            <Button
                onClick={() =>
                    sendMessage({
                        text: 'Hello, World!',
                        author: {
                            name: currentUser.basicProfile?.name || 'Anon',
                            did: currentUser.selfID.id,
                        },
                        timestamp: new Date().getTime(),
                    })
                }
            >
                Send
            </Button>
            {messages.map((msg) => (
                <ChatMessage currentUser={currentUser} message={msg} />
            ))}
        </>
    )
}
