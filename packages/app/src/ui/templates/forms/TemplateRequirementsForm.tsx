import {
    Box,
    Button,
    Form,
    FormExtendedEvent,
    FormField,
    TextArea,
} from 'grommet'
import { SetStateAction, useEffect, useState } from 'react'

import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import TwoButtonWrapContainer from '@cambrian/app/components/containers/TwoButtonWrapContainer'

interface TemplateRequirementsFormProps {
    templateInput: TemplateModel
    setTemplateInput: React.Dispatch<SetStateAction<TemplateModel | undefined>>
    onSubmit: () => Promise<void>
    submitLabel?: string
    onCancel: () => void
    cancelLabel?: string
}

export type TemplateRequirementsFormType = {
    requirements: string
}

const TemplateRequirementsForm = ({
    templateInput,
    setTemplateInput,
    onSubmit,
    submitLabel,
    onCancel,
    cancelLabel,
}: TemplateRequirementsFormProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        return () => {}
    }, [])

    const handleSubmit = async (
        event: FormExtendedEvent<TemplateRequirementsFormType, Element>
    ) => {
        event.preventDefault()
        setIsSubmitting(true)
        await onSubmit()
        setIsSubmitting(false)
    }

    return (
        <Form<TemplateRequirementsFormType> onSubmit={handleSubmit}>
            <Box height="50vh" justify="between">
                <Box pad="xsmall">
                    <FormField label="Requirements" name="requirements">
                        <TextArea
                            value={templateInput.requirements}
                            resize={false}
                            rows={10}
                            onChange={(e) =>
                                setTemplateInput({
                                    ...templateInput,
                                    requirements: e.target.value,
                                })
                            }
                        />
                    </FormField>
                </Box>
                <TwoButtonWrapContainer
                    primaryButton={
                        <LoaderButton
                            isLoading={isSubmitting}
                            size="small"
                            primary
                            label={submitLabel || 'Save'}
                            type="submit"
                        />
                    }
                    secondaryButton={
                        <Button
                            size="small"
                            secondary
                            label={cancelLabel || 'Reset all changes'}
                            onClick={onCancel}
                        />
                    }
                />
            </Box>
        </Form>
    )
}

export default TemplateRequirementsForm
