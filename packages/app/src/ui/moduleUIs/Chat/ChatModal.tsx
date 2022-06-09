import { useEffect, useState } from 'react'

import BaseLayerModal from '../../../components/modals/BaseLayerModal'
import { Box } from 'grommet'
import ChatContent from './ChatContent'
import ChatInput from '@cambrian/app/ui/moduleUIs/Chat/ChatInput'
import { ChatMessageType } from '@cambrian/app/ui/moduleUIs/Chat/ChatMessage'
import { IPFSAPI } from '@cambrian/app/services/api/IPFS.api'
import LoadingScreen from '../../../components/info/LoadingScreen'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { ethers } from 'ethers'

interface ChatModalProps {
    currentUser: UserType
    onBack: () => void
    solverContract: ethers.Contract
    currentCondition: SolverContractCondition
}

const ChatModal = ({
    onBack,
    currentUser,
    solverContract,
    currentCondition,
}: ChatModalProps) => {
    const ipfs = new IPFSAPI()
    const [messages, setMessages] = useState<ChatMessageType[]>([])
    const [transactionMessage, setTransactionMessage] = useState<string>()

    useEffect(() => {
        initChat()
        // TODO Lift Chat Listener init and integrate 'unread messages' notifications
        initChatListener()
    }, [])

    const initChat = async () => {
        const logs = await solverContract.queryFilter(
            solverContract.filters.SentMessage()
        )

        const cids = logs.map((l) => l.args?.cid).filter(Boolean)
        const newMessages = (await ipfs.getManyFromCID(
            cids
        )) as ChatMessageType[]

        const currentConditionMessages = newMessages.filter(
            (message) => message.conditionId === currentCondition.conditionId
        )

        setMessages([...currentConditionMessages] as ChatMessageType[])
    }

    const initChatListener = async () => {
        solverContract.on(
            solverContract.filters.SentMessage(),
            async (cid, sender) => {
                try {
                    const chatMsg = (await ipfs.getFromCID(
                        cid
                    )) as ChatMessageType

                    if (chatMsg && chatMsg.conditionId) {
                        setMessages(
                            (prevMessages) =>
                                [...prevMessages, chatMsg] as ChatMessageType[]
                        )
                        setTransactionMessage(undefined)
                    }
                } catch (e) {
                    cpLogger.push(e)
                }
            }
        )
    }

    return (
        <>
            <BaseLayerModal onBack={onBack}>
                <Box fill gap="small">
                    <ChatContent
                        currentUser={currentUser}
                        messages={messages}
                    />
                    <ChatInput
                        ipfsAPI={ipfs}
                        solverContract={solverContract}
                        currentCondition={currentCondition}
                        currentUser={currentUser}
                        setTransactionMessage={setTransactionMessage}
                    />
                </Box>
            </BaseLayerModal>
            {transactionMessage && (
                <LoadingScreen context={transactionMessage} />
            )}
        </>
    )
}

export default ChatModal
