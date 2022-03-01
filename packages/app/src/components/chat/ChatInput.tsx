import { Box, Button, Form, FormField, Spinner, TextInput } from 'grommet'

import { PaperPlaneRight } from 'phosphor-react'
import { useState } from 'react'

interface ChatInputProps {
    onSubmitChat: (text: string) => Promise<void>
    isLoading: boolean
}

type ChatInputFormType = {
    text: string
}

const initialInput = {
    text: '',
}

const ChatInput = ({ onSubmitChat, isLoading }: ChatInputProps) => {
    const [input, setInput] = useState(initialInput)

    const onSubmit = async () => {
        await onSubmitChat(input.text)
        setInput(initialInput)
    }

    return (
        <Form<ChatInputFormType>
            onChange={(nextValue: ChatInputFormType) => {
                setInput(nextValue)
            }}
            value={input}
            onSubmit={() => {
                onSubmitChat(input.text)
                setInput(initialInput)
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
                            disabled={isLoading}
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
                    disabled={isLoading}
                    icon={
                        isLoading ? (
                            <Spinner size="xsmall" />
                        ) : (
                            <PaperPlaneRight size="26" />
                        )
                    }
                    onClick={onSubmit}
                />
            </Box>
        </Form>
    )
}

export default ChatInput
