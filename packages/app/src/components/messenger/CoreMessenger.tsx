import { Box, Button, Form, TextInput } from 'grommet'
import ChatMessage, { ChatMessageType } from './ChatMessage'
import { useEffect, useRef, useState } from 'react'

import { GENERAL_ERROR } from '../../constants/ErrorMessages'
import { PaperPlaneRight } from 'phosphor-react'
import { TRILOBOT_WS_ENDPOINT } from 'packages/app/config'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { UserType } from '../../store/UserContext'
import _ from 'lodash'
import { ceramicInstance } from '@cambrian/app/services/ceramic/CeramicUtils'
import { cpLogger } from '../../services/api/Logger.api'
import io from 'socket.io-client'

/**
 * Messages are stored for a user in:
 *
 * TileDocument.deterministic(<client>, {
 *  controllers: [<did:pkh>],
 *  family: "cambrian-chat"
 *  tags: [<chatID>]
 * })
 *
 * Where <chatID> is:
 *
 *  Active Solver => <solverAddress>
 *  Proposal => <proposalStreamID>
 */

const socket = io(TRILOBOT_WS_ENDPOINT) // TODO Replace with env var

export type ChatType = 'Proposal' | 'Solver' | 'Other'

export default function CoreMessenger({
    currentUser,
    chatID,
    chatType,
    participants,
    showMessenger,
}: {
    currentUser: UserType
    chatID: string
    chatType: ChatType
    participants: string[] // For 'Other'
    showMessenger?: boolean // to prevent reinit on hide
}) {
    // useRef for publishing messages in outbox, otherwise setInterval has stale state
    const outboxCallback = useRef(async () => {})

    // Queued messages for publishing to Ceramic
    const [outbox, setOutbox] = useState<ChatMessageType[]>([])

    const [messages, setMessages] = useState<ChatMessageType[]>([])
    const [messageInput, setMessageInput] = useState('')

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

    useEffect(() => {
        document
            .getElementById('chat-end')
            ?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    useEffect(() => {
        document.getElementById('chat-end')?.scrollIntoView()
    }, [showMessenger])

    // Publish to ceramic every n seconds
    // Because: Multiple publishes in a short time can fail
    useEffect(() => {
        const outboxInterval = setInterval(() => outboxCallback.current(), 3000)
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
            case 'Proposal':
                msgs = await loadChatProposal()
                setMessages(msgs)
                break
            case 'Other':
                msgs = await loadChatOther()
                setMessages(msgs)
                break
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
            setMessageInput('')
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
            const messagesDoc: TileDocument<{ messages: ChatMessageType[] }> =
                await TileDocument.deterministic(
                    ceramicInstance(currentUser),
                    {
                        controllers: [currentUser.did],
                        family: 'cambrian-chat',
                        tags: [chatID],
                    },
                    { pin: true }
                )

            if (Array.isArray(messagesDoc.content?.messages)) {
                await messagesDoc.update(
                    {
                        messages: [
                            ...messagesDoc.content.messages,
                            ...messages,
                        ],
                    },
                    undefined,
                    { pin: true }
                )
            } else {
                await messagesDoc.update(
                    { messages: [...messages] },
                    undefined,
                    {
                        pin: true,
                    }
                )
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
            const messagesDocs: TileDocument<{
                messages: ChatMessageType[]
            }>[] = (
                (
                    await Promise.allSettled(
                        participants.map((DID) =>
                            TileDocument.deterministic(
                                ceramicInstance(currentUser),
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
                        return res.status === 'fulfilled' && res.value
                    })
                    .filter(Boolean) as TileDocument<{
                    messages: ChatMessageType[]
                }>[]
            ).filter((doc) => doc.content?.messages?.length > 0)

            // Get message content
            const messages: ChatMessageType[][] = messagesDocs.map(
                (doc) => doc.content.messages
            )

            return mergeMessages(messages)
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_LOAD_ERROR']
        }
    }

    /**
     * @notice Loads an array of message streams from TileDocument<CeramicProposalModel>
     * @dev chatID == proposalStreamID of draft
     * @dev Gets DIDs from proposal.authors
     */
    const loadChatProposal = async () => {
        try {
            // Load, then filter out streams that failed to load & streams with no messages
            const messagesDocs: TileDocument<{
                messages: ChatMessageType[]
            }>[] = (
                (
                    await Promise.allSettled(
                        participants.map(
                            async (DID) =>
                                await TileDocument.deterministic(
                                    ceramicInstance(currentUser),
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
                    .filter(Boolean) as TileDocument<{
                    messages: ChatMessageType[]
                }>[]
            ).filter((doc) => doc.content?.messages?.length > 0)

            // Get message content
            const messages: ChatMessageType[][] = messagesDocs.map(
                (doc) => doc.content.messages
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
    const mergeMessages = (messages: ChatMessageType[][]) => {
        const mergedMessages = messages
            .reduce((prev, next) => prev.concat(next), []) // Array arrays together...
            .sort((a, b) => a.timestamp - b.timestamp) /// ...and sort by timestamp

        return mergedMessages
    }

    return (
        <>
            {showMessenger && (
                <Box gap="small" pad={{ horizontal: 'small', bottom: 'small' }}>
                    <Box
                        height={'medium'}
                        border
                        round="xsmall"
                        pad="small"
                        overflow={{ vertical: 'auto' }}
                        gap="small"
                    >
                        {messages.map((msg, index) => (
                            <ChatMessage
                                key={index}
                                currentUser={currentUser}
                                message={msg}
                                pending={
                                    outbox.findIndex((m) => _.isEqual(m, msg)) >
                                    -1
                                }
                            />
                        ))}
                        <div id="chat-end" />
                    </Box>
                    <Form
                        onSubmit={() =>
                            sendMessage({
                                text: messageInput,
                                author: {
                                    name:
                                        currentUser.cambrianProfileDoc.content
                                            ?.name || 'Anon',
                                    did: currentUser.did,
                                },
                                timestamp: new Date().getTime(),
                            })
                        }
                    >
                        <Box direction="row" align="center" gap="small">
                            <Box flex>
                                <TextInput
                                    placeholder="Write a message here"
                                    value={messageInput}
                                    onChange={(e) =>
                                        setMessageInput(e.target.value)
                                    }
                                />
                            </Box>
                            <Button
                                icon={<PaperPlaneRight />}
                                type="submit"
                                disabled={messageInput.trim() === ''}
                            />
                        </Box>
                    </Form>
                </Box>
            )}
        </>
    )
}
