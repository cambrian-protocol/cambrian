import BaseLayerModal from './BaseLayerModal'
import { Box } from 'grommet'
import ChatContent from '../chat/ChatContent'
import ChatInput from '../chat/ChatInput'
import { ChatMessageType } from '../chat/ChatMessage'

interface ChatModalProps {
    messages: ChatMessageType[]
    onBack: () => void
    onSubmitChat: (message: string) => Promise<void>
}

const ChatModal = ({ onBack, messages, onSubmitChat }: ChatModalProps) => {
    return (
        <BaseLayerModal onBack={onBack}>
            <Box fill gap="small">
                <ChatContent messages={messages} />
                <ChatInput onSubmitChat={onSubmitChat} />
            </Box>
        </BaseLayerModal>
    )
}

export default ChatModal
