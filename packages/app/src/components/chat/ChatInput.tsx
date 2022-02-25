import {
    Box,
    Button,
    Form,
    FormExtendedEvent,
    FormField,
    TextInput,
} from 'grommet'

import { PaperPlaneRight } from 'phosphor-react'
import { useEffect, useState } from 'react'

interface ChatInputProps {
    onSubmitChat: (text: string) => Promise<void>
}

type ChatInputFormType = {
    text: string
}

const initialInput = {
    text: '',
}

const ChatInput = ({ onSubmitChat }: ChatInputProps) => {
    const [input, setInput] = useState(initialInput)

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
                    icon={<PaperPlaneRight size="24" />}
                    onClick={() => {
                        onSubmitChat(input.text)
                        setInput(initialInput)
                    }}
                />
            </Box>
        </Form>
    )
}

export default ChatInput
