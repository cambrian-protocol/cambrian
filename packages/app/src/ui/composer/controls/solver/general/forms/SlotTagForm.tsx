import { Box } from 'grommet'
import { Button } from 'grommet'
import { CheckBox } from 'grommet'
import { Form } from 'grommet'
import { FormExtendedEvent } from 'grommet'
import { FormField } from 'grommet'
import { SetStateAction } from 'react'
import { TextArea } from 'grommet'

interface SlotTagFormProps {
    onSubmit: (event: FormExtendedEvent<{}, Element>) => void
    input: SlotTagFormInputType
    setInput: React.Dispatch<SetStateAction<SlotTagFormInputType>>
}

export type SlotTagFormInputType = {
    label: string
    description: string
    isFlex: boolean
}

const SlotTagForm = ({ onSubmit, input, setInput }: SlotTagFormProps) => {
    return (
        <Form<SlotTagFormInputType>
            value={input}
            onSubmit={(event) => onSubmit(event)}
            onChange={(nextValue: SlotTagFormInputType) => {
                setInput(nextValue)
            }}
        >
            <Box gap="medium">
                <FormField name="label" label="Label" />
                <FormField label="Description">
                    <TextArea name="description" rows={5} resize={false} />
                </FormField>
                <CheckBox
                    label="Will be finally defined during template and proposal creation process"
                    name="isFlex"
                />
                <Button primary label="Save" type="submit" />
            </Box>
        </Form>
    )
}

export default SlotTagForm
