import { Box, Text } from 'grommet'
import ChatMessage, { ChatMessageType } from './ChatMessage'

import { CircleDashed } from 'phosphor-react'
import { UserType } from '@cambrian/app/store/UserContext'
import { useEffect } from 'react'

interface ChatContentProps {
    messages: ChatMessageType[]
    currentUser: UserType
}

const ChatContent = ({ messages, currentUser }: ChatContentProps) => {
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
                <Box gap="small" justify="center" align="center">
                    <CircleDashed size="36" />
                    <Text>Nothing here yet</Text>
                </Box>
            ) : (
                <Box gap="medium">
                    {messages.map((message, idx) => (
                        <ChatMessage
                            key={idx}
                            message={message}
                            currentUser={currentUser}
                        />
                    ))}
                    <Box id="end" pad="small" />
                </Box>
            )}
        </Box>
    )
}

export default ChatContent
