import ChatModal from './ChatModal'
import { Chats } from 'phosphor-react'
import { ConditionStatus } from '@cambrian/app/models/ConditionStatus'
import FloatingActionButton from '@cambrian/app/components/buttons/FloatingActionButton'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { UserType } from '@cambrian/app/store/UserContext'
import { ethers } from 'ethers'
import { useState } from 'react'

interface ChatFABProps {
    currentCondition: SolverContractCondition
    currentUser: UserType
    solverContract: ethers.Contract
}

const ChatFAB = ({
    solverContract,
    currentUser,
    currentCondition,
}: ChatFABProps) => {
    const [showChatModal, setShowChatModal] = useState(false)

    const toggleShowChatModal = () => setShowChatModal(!showChatModal)

    return (
        <>
            {currentCondition.status !== ConditionStatus.Initiated ? (
                <>
                    <FloatingActionButton
                        icon={<Chats />}
                        onClick={toggleShowChatModal}
                    />
                    {showChatModal && (
                        <ChatModal
                            onBack={toggleShowChatModal}
                            currentCondition={currentCondition}
                            solverContract={solverContract}
                            currentUser={currentUser}
                        />
                    )}
                </>
            ) : (
                <></>
            )}
        </>
    )
}
export default ChatFAB
