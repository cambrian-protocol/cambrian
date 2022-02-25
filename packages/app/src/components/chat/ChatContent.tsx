import { Box, Text } from 'grommet'
import ChatMessage, { ChatMessageType } from './ChatMessage'
import { useEffect, useState } from 'react'

import { CircleDashed } from 'phosphor-react'

interface ChatContentProps {
    messages: ChatMessageType[]
}

const ChatContent = ({ messages }: ChatContentProps) => {
    // Keep user at the most recent message
    useEffect(() => {
        document.getElementById('end')?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

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
                    {messages.map((message, idx) => (
                        <ChatMessage key={idx} message={message} />
                    ))}
                    <Box id="end" pad="small" />
                </Box>
            )}
        </Box>
    )
}

export default ChatContent
