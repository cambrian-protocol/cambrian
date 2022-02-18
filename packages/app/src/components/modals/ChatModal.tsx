import BaseLayerModal from './BaseLayerModal'
import { Box } from 'grommet'
import ChatContent from '../chat/ChatContent'
import ChatInput from '../chat/ChatInput'

interface ChatModalProps {
    solverAddress: string
    onBack: () => void
}

const ChatModal = ({ onBack, solverAddress }: ChatModalProps) => {
    return (
        <BaseLayerModal onBack={onBack}>
            <Box fill gap="small">
                <ChatContent solverAddress={solverAddress} />
                <ChatInput solverAddress={solverAddress} />
            </Box>
        </BaseLayerModal>
    )
}

export default ChatModal
