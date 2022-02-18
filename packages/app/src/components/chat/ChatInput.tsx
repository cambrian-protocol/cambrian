import {
    Box,
    Button,
    Form,
    FormExtendedEvent,
    FormField,
    TextInput,
} from 'grommet'

import { PaperPlaneRight } from 'phosphor-react'
import { useState } from 'react'

interface ChatInputProps {
    solverAddress: string
}

type ChatInputFormType = {
    message: string
}

const initalInput = {
    message: '',
}

const ChatInput = ({ solverAddress }: ChatInputProps) => {
    const [input, setInput] = useState(initalInput)

    const onSubmit = (event: FormExtendedEvent) => {
        // TODO Post message
    }

    return (
        <Form<ChatInputFormType>
            onChange={(nextValue: ChatInputFormType) => {
                setInput(nextValue)
            }}
            value={input}
            onSubmit={(event) => onSubmit(event)}
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
                        <TextInput placeholder="Write a message here" />
                    </FormField>
                </Box>
                <Button icon={<PaperPlaneRight size="24" />} />
            </Box>
        </Form>
    )
}

export default ChatInput
