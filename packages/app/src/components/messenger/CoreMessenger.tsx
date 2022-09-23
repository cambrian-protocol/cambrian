import { Box, Button, Form, TextInput } from 'grommet'
import ChatMessage, { ChatMessageType } from './ChatMessage'
import { useEffect, useRef, useState } from 'react'

import { GENERAL_ERROR } from '../../constants/ErrorMessages'
import { PaperPlaneRight } from 'phosphor-react'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { UserType } from '../../store/UserContext'
import _ from 'lodash'
import { ceramicInstance } from '@cambrian/app/services/ceramic/CeramicUtils'
import { cpLogger } from '../../services/api/Logger.api'

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

type ChatMessagesType = { messages: ChatMessageType[] }

export default function CoreMessenger({
    currentUser,
    chatID,
    participants,
    showMessenger,
}: {
    currentUser: UserType
    chatID: string
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
        initSubscriptions()
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

    // Subscribe to Messages TileDocuments
    const initSubscriptions = async () => {
        const messagesDocs = await fetchMessagesDocs()
        const subscriptions = messagesDocs.map((doc) =>
            doc.subscribe(() => {
                if (outbox.length === 0) {
                    loadChat()
                }
            })
        )
        return () => {
            subscriptions.map((sub) => sub.unsubscribe())
        }
    }

    const fetchMessagesDocs = async () => {
        return (
            await Promise.allSettled(
                participants.concat(currentUser.did).map(
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
            .map((res) => {
                return res.status === 'fulfilled' && res.value
            })
            .filter(Boolean) as TileDocument<ChatMessagesType>[]
    }

    // Load chat
    const loadChat = async () => {
        try {
            const messagesDocs = await fetchMessagesDocs()
            // Get message content
            const messages: ChatMessageType[][] = messagesDocs
                .filter((doc) => doc.content?.messages?.length > 0)
                .map((doc) => doc.content.messages)
            setMessages(mergeMessages(messages))
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_LOAD_ERROR']
        }
    }

    // Add message to state and outbox
    const sendMessage = async (message: ChatMessageType) => {
        try {
            setMessages((oldMessages) => [...oldMessages, message])
            setOutbox((oldOutbox) => [...oldOutbox, message])
            setMessageInput('')
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
        }
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
