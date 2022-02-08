import BaseLayerModal from './BaseLayerModal'
import { Box } from 'grommet'
import ChatContent from '../chat/ChatContent'
import ChatInput from '../chat/ChatInput'

interface ChatModalProps {
    onBack: () => void
}

const ChatModal = ({ onBack }: ChatModalProps) => {
    return (
        <BaseLayerModal onBack={onBack}>
            <Box fill gap="small">
                <ChatContent />
                <ChatInput />
            </Box>
        </BaseLayerModal>
    )
}

export default ChatModal
