import { Box, Text } from 'grommet'
import { Check, Clock } from 'phosphor-react'

import { UserType } from '@cambrian/app/store/UserContext'

interface ChatMessageProps {
    message: ChatMessageType
    currentUser: UserType
    pending: boolean
}

export type ChatMessageType = {
    text: string
    author: {
        name: string
        did: string
    }
    timestamp: number
    images?: string[]
}

const ChatMessage = ({ message, currentUser, pending }: ChatMessageProps) => {
    const isSender = currentUser.did === message.author?.did

    return (
        <Box
            height={{ min: 'auto' }}
            pad={isSender ? { left: 'medium' } : { right: 'medium' }}
        >
            <Box
                alignSelf={isSender ? 'end' : 'start'}
                background={isSender ? 'accent-2' : 'accent-1'}
                pad={{ horizontal: 'small', vertical: 'xsmall' }}
                round={'xsmall'}
                width={{ min: 'xsmall', max: 'medium' }}
                elevation="small"
            >
                {!isSender && (
                    <Text size="xsmall" color="brand" weight={'bold'}>
                        {message.author?.name || message.author?.did}
                    </Text>
                )}
                <Text size="small" wordBreak={'break-word'}>
                    {message.text}
                </Text>
                <Box align="end" justify="between" direction="row">
                    {isSender ? pending ? <Clock /> : <Check /> : <Box />}
                    <Text size="xsmall" color="light-6">
                        {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </Text>
                </Box>
            </Box>
        </Box>
    )
}

export default ChatMessage
