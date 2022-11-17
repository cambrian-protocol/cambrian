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
import TwoButtonWrapContainer from '@cambrian/app/components/containers/TwoButtonWrapContainer'
import useEditTemplate from '@cambrian/app/hooks/useEditTemplate'

interface TemplateRequirementsFormProps {
    submitLabel?: string
    cancelLabel?: string
}

export type TemplateRequirementsFormType = {
    requirements: string
}

const TemplateRequirementsForm = ({
    submitLabel,
    cancelLabel,
}: TemplateRequirementsFormProps) => {
    const { template, setTemplate, onSaveTemplate, onResetTemplate } =
        useEditTemplate()

    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        return () => {}
    }, [])

    const handleSubmit = async (
        event: FormExtendedEvent<TemplateRequirementsFormType, Element>
    ) => {
        event.preventDefault()
        setIsSubmitting(true)
        await onSaveTemplate()
        setIsSubmitting(false)
    }

    if (!template) {
        return null
    }

    return (
        <Form<TemplateRequirementsFormType> onSubmit={handleSubmit}>
            <Box height="50vh" justify="between">
                <Box pad="xsmall">
                    <FormField label="Requirements" name="requirements">
                        <TextArea
                            value={template.requirements}
                            resize={false}
                            rows={10}
                            onChange={(e) =>
                                setTemplate({
                                    ...template,
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
                            onClick={onResetTemplate}
                        />
                    }
                />
            </Box>
        </Form>
    )
}

export default TemplateRequirementsForm
