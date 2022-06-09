import { Box, Text } from 'grommet'

import { ParticipantModel } from '@cambrian/app/models/ParticipantModel'
import { UserType } from '@cambrian/app/store/UserContext'

interface ChatMessageProps {
    message: ChatMessageType
    currentUser: UserType
}

export type ChatMessageType = {
    id?: string
    sender: ParticipantModel
    text: string
    conditionId: string
    timestamp: Date
}

const ChatMessage = ({ message, currentUser }: ChatMessageProps) => {
    const isSender = currentUser.address === message.sender.address

    return (
        <Box
            alignSelf={isSender ? 'end' : 'start'}
            background={isSender ? 'accent-2' : 'background-contrast'}
            pad={{ horizontal: 'medium', vertical: 'small' }}
            round={'small'}
            width={{ max: 'medium' }}
            elevation="small"
            height={{ min: 'auto' }}
        >
            {!isSender && (
                <Text size="xsmall" color="brand" weight={'bold'}>
                    {message.sender.name || message.sender.address}
                </Text>
            )}
            <Text size="small">{message.text}</Text>
            <Box align="end">
                <Text size="xsmall" color="light-6">
                    {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </Text>
            </Box>
        </Box>
    )
}

export default ChatMessage