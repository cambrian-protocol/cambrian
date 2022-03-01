import BaseLayerModal from './BaseLayerModal'
import { Box } from 'grommet'
import ChatContent from '../chat/ChatContent'
import ChatInput from '../chat/ChatInput'
import { ChatMessageType } from '../chat/ChatMessage'
import { UserType } from '@cambrian/app/store/UserContext'

interface ChatModalProps {
    messages: ChatMessageType[]
    currentUser: UserType
    onBack: () => void
    onSubmitChat: (message: string) => Promise<void>
    isLoading: boolean
}

const ChatModal = ({
    onBack,
    messages,
    onSubmitChat,
    currentUser,
    isLoading,
}: ChatModalProps) => {
    return (
        <BaseLayerModal onBack={onBack}>
            <Box fill gap="small">
                <ChatContent currentUser={currentUser} messages={messages} />
                <ChatInput isLoading={isLoading} onSubmitChat={onSubmitChat} />
            </Box>
        </BaseLayerModal>
    )
}

export default ChatModal
