import { Button } from 'grommet'
import { CheckBox } from 'grommet'
import { Form } from 'grommet'
import { FormExtendedEvent } from 'grommet'
import { FormField } from 'grommet'
import { SetStateAction } from 'react'

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
            <FormField name="label" label="Label" />
            <FormField name="description" label="Description" />
            <CheckBox label="Is flexible?" name="isFlex" />
            <Button primary label="Save" type="submit" />
        </Form>
    )
}

export default SlotTagForm
