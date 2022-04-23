import { Box, Button, Form, FormField, Spinner, TextInput } from 'grommet'
import { SetStateAction, useState } from 'react'

import { ChatMessageType } from './ChatMessage'
import { ERROR_MESSAGE } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '../modals/ErrorPopupModal'
import { IPFSAPI } from '@cambrian/app/services/api/IPFS.api'
import { PaperPlaneRight } from 'phosphor-react'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { TRANSACITON_MESSAGE } from '@cambrian/app/constants/TransactionMessages'
import { UserType } from '@cambrian/app/store/UserContext'
import { ethers } from 'ethers'

interface ChatInputProps {
    ipfsAPI: IPFSAPI
    currentUser: UserType
    currentCondition: SolverContractCondition
    solverContract: ethers.Contract
    setTransactionMessage: React.Dispatch<SetStateAction<string | undefined>>
}

type ChatInputFormType = {
    text: string
}

const initialInput = {
    text: '',
}

const ChatInput = ({
    ipfsAPI,
    currentUser,
    currentCondition,
    solverContract,
    setTransactionMessage,
}: ChatInputProps) => {
    const [input, setInput] = useState(initialInput)

    const [errorMsg, setErrorMsg] = useState<string>()

    const onSubmit = async () => {
        if (!currentUser.address)
            throw new Error(ERROR_MESSAGE['NO_WALLET_CONNECTION'])

        setTransactionMessage(TRANSACITON_MESSAGE['CONFIRM'])
        const messageObj: ChatMessageType = {
            text: input.text,
            conditionId: currentCondition.conditionId,
            sender: { address: currentUser.address },
            timestamp: new Date(),
        }

        try {
            const response = await ipfsAPI.pin(messageObj)
            if (response?.IpfsHash) {
                await solverContract.sendMessage(
                    response.IpfsHash,
                    currentCondition.conditionId
                )
                setTransactionMessage(TRANSACITON_MESSAGE['WAIT'])
                setInput(initialInput)
            }
        } catch (error: any) {
            setErrorMsg(error.message)
            setTransactionMessage(undefined)
            console.error(error)
        }
    }

    return (
        <>
            <Form<ChatInputFormType>
                onChange={(nextValue: ChatInputFormType) => {
                    setInput(nextValue)
                }}
                value={input}
                onSubmit={() => {
                    onSubmit()
                }}
            >
                <Box
                    direction="row"
                    elevation="small"
                    pad="small"
                    round="small"
                    background="background-contrast"
                    gap="small"
                >
                    <Box flex>
                        <FormField>
                            <TextInput
                                value={input.text}
                                onChange={(event) => {
                                    setInput({
                                        text: event.target.value,
                                    })
                                }}
                                placeholder="Write a message here"
                            />
                        </FormField>
                    </Box>
                    <Button
                        icon={<PaperPlaneRight size="26" />}
                        onClick={onSubmit}
                    />
                </Box>
            </Form>

            {errorMsg && (
                <ErrorPopupModal
                    errorMessage={errorMsg}
                    onClose={() => setErrorMsg(undefined)}
                />
            )}
        </>
    )
}

export default ChatInput
