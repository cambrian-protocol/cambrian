import { useEffect, useRef, useState } from 'react'
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

const socket = io('ws://localhost:4242') // TODO Replace with env var

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
    // useRef for publishing messages in outbox, otherwise setInterval has stale state
    const outboxCallback = useRef(async () => {})

    // Queued messages for publishing to Ceramic
    const [outbox, setOutbox] = useState<ChatMessageType[]>([])

    const [messages, setMessages] = useState<ChatMessageType[]>([])

    useEffect(() => {
        // Update chat upon receiving websocket emit
        socket.on(`cambrian-chat-${chatID}`, (message: ChatMessageType) => {
            setMessages((oldMessages) => [...oldMessages, message])
        })

        return () => {
            socket.disconnect()
        }
    }, [])

    useEffect(() => {
        loadChat()
    }, [])

    // Publish to ceramic every n seconds
    // Because: Multiple publishes in a short time can fail
    useEffect(() => {
        const outboxInterval = setInterval(() => outboxCallback.current(), 5000)
        return () => {
            clearInterval(outboxInterval)
            outboxCallback.current()
        }
    }, [])

    // Set useRef callback
    useEffect(() => {
        outboxCallback.current = publishOutbox
    })

    // Load chat based on type
    // Only difference is how we find the participants so we know which streams to load
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

    // Emit message to websocket
    // && add to outbox
    const sendMessage = async (message: ChatMessageType) => {
        try {
            socket.emit(`sendMessage`, {
                chatID: chatID,
                message: message,
            })

            addToOutbox(message)
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
        }
    }

    const addToOutbox = (message: ChatMessageType) => {
        setOutbox((oldOutbox) => [...oldOutbox, message])
    }

    // Call publishMessages with outbox
    // Clear outbox IF it succeeded
    const publishOutbox = async () => {
        try {
            if (outbox.length > 0) {
                const success = await publishMessages(outbox)
                if (success) {
                    setOutbox([])
                }
            }
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
        }
    }

    // Publish an array of messages (append to existing)
    const publishMessages = async (messages: ChatMessageType[]) => {
        try {
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
                await messagesDoc.update(
                    [...messagesDoc.content, ...messages],
                    undefined,
                    { pin: true }
                )
            } else {
                await messagesDoc.update([...messages], undefined, {
                    pin: true,
                })
            }

            return true
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
        }
    }

    // Load "Other" chat with supplied participant DIDs
    const loadChatOther = async () => {
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
     * @notice Loads an array of message streams from TileDocument<CeramicProposalModel>
     * @dev chatID == proposalID of draft
     * @dev Gets DIDs from proposal.authors
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
            {messages.map((msg, index) => (
                <ChatMessage
                    key={index}
                    currentUser={currentUser}
                    message={msg}
                />
            ))}
        </>
    )
}
