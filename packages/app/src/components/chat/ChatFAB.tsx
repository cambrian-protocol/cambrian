import ChatModal from '../modals/ChatModal'
import { Chats } from 'phosphor-react'
import FloatingActionButton from '../buttons/FloatingActionButton'
import { useState } from 'react'

interface ChatFABProps {
    solverAddress: string
}

const ChatFAB = ({ solverAddress }: ChatFABProps) => {
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
                    solverAddress={solverAddress}
                    onBack={toggleShowChatModal}
                />
            )}
        </>
    )
}
export default ChatFAB
