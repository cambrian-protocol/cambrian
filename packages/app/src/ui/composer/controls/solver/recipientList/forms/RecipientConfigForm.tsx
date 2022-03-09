import { Box, Button, Form, FormExtendedEvent, FormField } from 'grommet'

import BaseFormContainer from '@cambrian/app/components/containers/BaseFormContainer'
import { IconContext } from 'phosphor-react'
import { SetStateAction } from 'react'
import { required } from '@cambrian/app/utils/helpers/validation'

interface RecipientConfigFormProps {
    onSubmit: (event: FormExtendedEvent<RecipientFormType, Element>) => void
    recipientInput: RecipientFormType
    setRecipientInput: React.Dispatch<SetStateAction<RecipientFormType>>
    submitLabel: string
}

export const initialRecipientConfigFormInput = {
    address: '',
}

export type RecipientFormType = {
    address: string
}

const RecipientConfigForm = ({
    onSubmit,
    recipientInput,
    setRecipientInput,
    submitLabel,
}: RecipientConfigFormProps) => {
    return (
        <BaseFormContainer>
            <Form<RecipientFormType>
                value={recipientInput}
                onSubmit={(event) => onSubmit(event)}
                onChange={(nextValue: RecipientFormType) => {
                    setRecipientInput(nextValue)
                }}
            >
                <FormField
                    name="address"
                    label="Address*"
                    validate={required}
                />
                <Box>
                    <Button primary type="submit" label={submitLabel} />
                </Box>
            </Form>
        </BaseFormContainer>
    )
}

export default RecipientConfigForm
