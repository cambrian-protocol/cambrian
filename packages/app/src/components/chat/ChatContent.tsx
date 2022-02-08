import { Box, Text } from 'grommet'
import ChatMessage, { ChatMessageType } from './ChatMessage'
import { useEffect, useState } from 'react'

import { CircleDashed } from 'phosphor-react'

const ChatContent = () => {
    const [messages, setMessages] = useState<ChatMessageType[]>([])

    // Fetch messages
    useEffect(() => {
        const messagesDummy: ChatMessageType[] = [
            {
                id: '0',
                message:
                    'Love it so far, but could you go a little more into detail?',
                sender: { name: 'You', address: '0x12345' },
                timestamp: new Date(),
            },
            {
                id: '1',
                message: 'Sure, give me a couple of hours',
                sender: { name: 'Writer', address: '0x54321' },
                timestamp: new Date(),
            },
        ]

        setMessages(messagesDummy)
    }, [])

    return (
        <Box
            pad={'small'}
            flex
            elevation="small"
            background="background-contrast"
            round="small"
            overflow={{ vertical: 'auto' }}
        >
            {messages.length === 0 ? (
                <>
                    <CircleDashed size="36" />
                    <Text>Nothing here yet</Text>
                </>
            ) : (
                <Box gap="medium">
                    {messages.map((message) => (
                        <ChatMessage key={message.id} message={message} />
                    ))}
                </Box>
            )}
        </Box>
    )
}

export default ChatContent
