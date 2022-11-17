import {
    Box,
    Button,
    Form,
    FormExtendedEvent,
    FormField,
    TextArea,
    TextInput,
} from 'grommet'
import { SetStateAction, useEffect, useState } from 'react'

import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import TwoButtonWrapContainer from '@cambrian/app/components/containers/TwoButtonWrapContainer'
import { isRequired } from '@cambrian/app/utils/helpers/validation'
import useEditTemplate from '@cambrian/app/hooks/useEditTemplate'

export type TemplateDescriptionFormType = {
    title: string
    description: string
}
interface TemplateDescriptionFormProps {
    submitLabel?: string
    cancelLabel?: string
}

const TemplateDescriptionForm = ({
    submitLabel,
    cancelLabel,
}: TemplateDescriptionFormProps) => {
    const { template, setTemplate, onSaveTemplate, onResetTemplate } =
        useEditTemplate()

    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        return () => {}
    }, [])

    const handleSubmit = async (
        event: FormExtendedEvent<TemplateDescriptionFormType, Element>
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
        <Form onSubmit={handleSubmit}>
            <Box height={{ min: '50vh' }} justify="between">
                <Box height={{ min: 'auto' }} pad="xsmall">
                    <FormField
                        name="title"
                        label="Title"
                        validate={[() => isRequired(template.title)]}
                    >
                        <TextInput
                            placeholder='Short summary of your service, i.e. "English to Spanish Technical Translation."'
                            value={template.title}
                            onChange={(e) =>
                                setTemplate({
                                    ...template,
                                    title: e.target.value,
                                })
                            }
                        />
                    </FormField>
                    <FormField
                        name="description"
                        label="Description"
                        validate={[() => isRequired(template.description)]}
                    >
                        <TextArea
                            placeholder="Describe your service at length. Communicate your unique value, details of your service, and the format and content of information you need from customers. Customers will send proposals in response to this description."
                            rows={15}
                            resize={false}
                            value={template.description}
                            onChange={(e) =>
                                setTemplate({
                                    ...template,
                                    description: e.target.value,
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

export default TemplateDescriptionForm
