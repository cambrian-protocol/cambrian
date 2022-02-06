import { Box, Button, Form, FormExtendedEvent, FormField } from 'grommet'

import { IconContext } from 'phosphor-react'
import { RecipientFormType } from './CreateRecipientForm'
import { SetStateAction } from 'react'
import { required } from '@cambrian/app/utils/helpers/validation'

interface RecipientConfigFormProps {
    onSubmit: (event: FormExtendedEvent<RecipientFormType, Element>) => void
    recipientInput: RecipientFormType
    setRecipientInput: React.Dispatch<SetStateAction<RecipientFormType>>
    submitLabel: string
}

const RecipientConfigForm = ({
    onSubmit,
    recipientInput,
    setRecipientInput,
    submitLabel,
}: RecipientConfigFormProps) => {
    return (
        <Form<RecipientFormType>
            value={recipientInput}
            onSubmit={(event) => onSubmit(event)}
            onChange={(nextValue: RecipientFormType) => {
                setRecipientInput(nextValue)
            }}
        >
            <FormField name="address" label="Address*" validate={required} />
            <FormField name="description" label="Descriptive Name (Optional)" />
            <Box>
                <IconContext.Provider value={{ size: '24' }}>
                    <Button primary type="submit" label={submitLabel} />
                </IconContext.Provider>
            </Box>
        </Form>
    )
}

export default RecipientConfigForm
