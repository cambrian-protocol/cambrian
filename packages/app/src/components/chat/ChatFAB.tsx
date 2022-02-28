import { ChatMessageType } from './ChatMessage'
import ChatModal from '../modals/ChatModal'
import { Chats } from 'phosphor-react'
import FloatingActionButton from '../buttons/FloatingActionButton'
import { UserType } from '@cambrian/app/store/UserContext'
import { useState } from 'react'

interface ChatFABProps {
    currentUser: UserType
    messages: ChatMessageType[]
    onSubmitChat: (message: string) => Promise<void>
}

const ChatFAB = ({ messages, onSubmitChat, currentUser }: ChatFABProps) => {
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
                    currentUser={currentUser}
                    messages={messages}
                    onSubmitChat={onSubmitChat}
                    onBack={toggleShowChatModal}
                />
            )}
        </>
    )
}
export default ChatFAB
