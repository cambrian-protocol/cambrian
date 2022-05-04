import { Box, Button, Form, FormExtendedEvent, FormField } from 'grommet'
import React, { SetStateAction } from 'react'

import BaseFormContainer from '@cambrian/app/components/containers/BaseFormContainer'
import { IconContext } from 'phosphor-react'
import { OutcomeModel } from '@cambrian/app/models/OutcomeModel'

interface OutcomeConfigFormProps {
    onSubmit: (event: FormExtendedEvent<OutcomeModel, Element>) => void
    outcomeInput: OutcomeModel
    setOutcomeInput: React.Dispatch<SetStateAction<OutcomeModel>>
    submitLabel: string
}

const OutcomeConfigForm = ({
    onSubmit,
    outcomeInput,
    setOutcomeInput,
    submitLabel,
}: OutcomeConfigFormProps) => (
    <BaseFormContainer>
        <Form<OutcomeModel>
            value={outcomeInput}
            onSubmit={(event) => onSubmit(event)}
            onChange={(nextValue: OutcomeModel) => {
                setOutcomeInput(nextValue)
            }}
        >
            <FormField name="title" label="Title" required />
            <FormField name="description" label="Description" required />
            <FormField name="uri" label="URI" required />
            <FormField name="context" label="Context" />
            <IconContext.Provider value={{ size: '24' }}>
                <Box>
                    <Button primary type="submit" label={submitLabel} />
                </Box>
            </IconContext.Provider>
        </Form>
    </BaseFormContainer>
)

export default OutcomeConfigForm
