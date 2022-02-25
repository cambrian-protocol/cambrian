import ChatModal from '../modals/ChatModal'
import { Chats } from 'phosphor-react'
import FloatingActionButton from '../buttons/FloatingActionButton'
import { useState } from 'react'
import { ChatMessageType } from './ChatMessage'

interface ChatFABProps {
    solverAddress: string
    messages: ChatMessageType[]
    onSubmitChat: (message: string) => Promise<void>
}

const ChatFAB = ({ messages, onSubmitChat }: ChatFABProps) => {
    const [showChatModal, setShowChatModal] = useState(false)

    const toggleShowChatModal = () => setShowChatModal(!showChatModal)

    return (
        <>
            <FloatingActionButton
                icon={<Chats />}
                onClick={toggleShowChatModal}
            />
            {showChatModal && (
                <ChatModal
                    messages={messages}
                    onSubmitChat={onSubmitChat}
                    onBack={toggleShowChatModal}
                />
            )}
        </>
    )
}
export default ChatFAB
