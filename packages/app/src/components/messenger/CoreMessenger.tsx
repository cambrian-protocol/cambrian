import API, { DocumentModel } from '@cambrian/app/services/api/cambrian.api'
import { Box, Button, Form, TextInput } from 'grommet'
import ChatMessage, { ChatMessageType } from './ChatMessage'
import { useEffect, useRef, useState } from 'react'

import { GENERAL_ERROR } from '../../constants/ErrorMessages'
import MESSAGE from '../../../public/sounds/new-message.mp3'
import { PaperPlaneRight } from 'phosphor-react'
import { UserType } from '../../store/UserContext'
import _ from 'lodash'
import { cpLogger } from '../../services/api/Logger.api'
import { useNotificationCountContext } from '@cambrian/app/hooks/useNotifcationCountContext'
import useSound from 'use-sound'

/**
 * Messages are stored for a user in:
 *
 * doc.deterministic(<client>, {
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

type UserChatDocType = {
    messages: ChatMessageType[]
    readMessagesCounter: number
}

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
    const [playNotificationSound] = useSound(MESSAGE)
    const playNotificationSoundCallback = useRef(playNotificationSound)

    const { setNotificationCounter, notificationCounter } =
        useNotificationCountContext()
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

    useEffect(() => {
        playNotificationSoundCallback.current = playNotificationSound
    })

    // Subscribe to Messages
    const initSubscriptions = async () => {
        const messagesDocs = await fetchMessagesDocs(
            participants.filter(
                (participant) => participant !== currentUser.did
            )
        )

        const subscriptions = await Promise.all(
            messagesDocs.map(
                async (doc) =>
                    await API.doc.subscribe(doc.streamID, () => {
                        if (outbox.length === 0) {
                            loadChat()
                        }
                    })
            )
        )
        return () => {
            subscriptions.map((sub) => sub && sub.unsubscribe())
        }
    }

    const fetchMessagesDocs = async (dids: string[]) => {
        return (
            await Promise.allSettled(
                dids.map(
                    async (DID) =>
                        await API.doc.deterministic<UserChatDocType>({
                            controllers: [DID],
                            family: 'cambrian-chat',
                            tags: [chatID],
                        })
                )
            )
        )
            .map((res) => {
                return res.status === 'fulfilled' && res.value
            })
            .filter(Boolean) as DocumentModel<UserChatDocType>[]
    }

    // Load chat
    const loadChat = async () => {
        try {
            const messagesDocs = await fetchMessagesDocs(participants)
            const fetchedMessages: ChatMessageType[][] = messagesDocs
                .filter((doc) => doc.content?.messages?.length > 0)
                .map((doc) => doc.content.messages)

            const usersReadMessagesCounter = messagesDocs.find(
                (m) =>
                    m.metadata?.controllers &&
                    m.metadata.controllers[0] === currentUser.did
            )?.content.readMessagesCounter

            const fetchedMergedMessages = mergeMessages(fetchedMessages)
            if (
                usersReadMessagesCounter === undefined ||
                fetchedMergedMessages.length >= usersReadMessagesCounter
            ) {
                setMessages(fetchedMergedMessages)
                updateMessageNotification(
                    fetchedMergedMessages.length,
                    usersReadMessagesCounter
                )
            }
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_LOAD_ERROR']
        }
    }

    const updateMessageNotification = (
        allMessagesCounter: number,
        readMessagesCounter?: number
    ) => {
        let unreadMessages = 0
        if (readMessagesCounter === undefined) {
            unreadMessages = allMessagesCounter
        } else if (readMessagesCounter < allMessagesCounter) {
            unreadMessages = allMessagesCounter - readMessagesCounter
        }

        if (unreadMessages !== notificationCounter) {
            //playNotificationSoundCallback.current()
            setNotificationCounter(unreadMessages)
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
            if (!currentUser.did || !currentUser.session)
                throw GENERAL_ERROR['NO_CERAMIC_CONNECTION']

            const messagesDoc = await API.doc.deterministic<UserChatDocType>({
                controllers: [currentUser.did],
                family: 'cambrian-chat',
                tags: [chatID],
            })

            if (!messagesDoc) throw Error('Failed to fetch messagesDoc')

            const updatedReadMessagesCounter =
                messagesDoc.content.readMessagesCounter + messages.length

            if (Array.isArray(messagesDoc.content?.messages)) {
                await API.doc.updateStream(currentUser, messagesDoc.streamID, {
                    readMessagesCounter: updatedReadMessagesCounter,
                    messages: [...messagesDoc.content.messages, ...messages],
                })
            } else {
                await API.doc.updateStream(currentUser, messagesDoc.streamID, {
                    readMessagesCounter: updatedReadMessagesCounter,
                    messages: [...messages],
                })
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

    const updateReadMessagesCounter = async (
        updatedReadMessagesCounter: number
    ) => {
        if (!currentUser.did || !currentUser.session)
            throw GENERAL_ERROR['NO_CERAMIC_CONNECTION']

        const messagesDoc = await API.doc.deterministic<UserChatDocType>({
            controllers: [currentUser.did],
            family: 'cambrian-chat',
            tags: [chatID],
        })

        if (
            messagesDoc &&
            messagesDoc.content.readMessagesCounter !==
                updatedReadMessagesCounter
        ) {
            await API.doc.updateStream(currentUser, messagesDoc.streamID, {
                ...messagesDoc.content,
                readMessagesCounter: updatedReadMessagesCounter,
            })
        }
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
                        onSubmit={
                            currentUser.did
                                ? () =>
                                      sendMessage({
                                          text: messageInput,
                                          author: {
                                              name:
                                                  currentUser.cambrianProfileDoc
                                                      ?.content?.name || 'Anon',
                                              did: currentUser.did!,
                                          },
                                          timestamp: new Date().getTime(),
                                      })
                                : undefined
                        }
                    >
                        <Box direction="row" align="center" gap="small">
                            <Box flex>
                                <TextInput
                                    disabled={!currentUser.session}
                                    placeholder={
                                        currentUser.session
                                            ? 'Write a message here'
                                            : 'Missing Ceramic Connection'
                                    }
                                    value={messageInput}
                                    onChange={(e) =>
                                        setMessageInput(e.target.value)
                                    }
                                    onFocus={() => {
                                        updateReadMessagesCounter(
                                            messages.length
                                        )
                                        setNotificationCounter(0)
                                    }}
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
