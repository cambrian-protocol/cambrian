import { Box, Text } from 'grommet'

import { ParticipantModel } from '@cambrian/app/models/ParticipantModel'

interface ChatMessageProps {
    message: ChatMessageType
}

export type ChatMessageType = {
    id: string
    sender: ParticipantModel
    message: string
    timestamp: Date
}

const ChatMessage = ({ message }: ChatMessageProps) => {
    // TODO compare with current User
    const isSender = '0x12345' === message.sender.address

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
                    {message.sender.name}
                </Text>
            )}
            <Text size="small">{message.message}</Text>
            <Box align="end">
                <Text size="xsmall" color="light-6">
                    {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </Text>
            </Box>
        </Box>
    )
}

export default ChatMessage
