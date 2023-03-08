import {
    Box,
    Button,
    Form,
    FormExtendedEvent,
    FormField,
    TextArea,
    TextInput,
} from 'grommet'

import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import Template from '@cambrian/app/classes/stages/Template'
import TwoButtonWrapContainer from '@cambrian/app/components/containers/TwoButtonWrapContainer'
import _ from 'lodash'
import { isRequired } from '@cambrian/app/utils/helpers/validation'
import { useState } from 'react'

export type TemplateDescriptionFormType = {
    title: string
    description: string
}
interface TemplateDescriptionFormProps {
    template: Template
    onSubmit?: () => void
    onCancel?: () => void
    submitLabel?: string
    cancelLabel?: string
}

const TemplateDescriptionForm = ({
    template,
    onSubmit,
    onCancel,
    submitLabel,
    cancelLabel,
}: TemplateDescriptionFormProps) => {
    const [title, setTitle] = useState(template.content.title)
    const [description, setDescription] = useState(template.content.description)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (
        event: FormExtendedEvent<TemplateDescriptionFormType, Element>
    ) => {
        event.preventDefault()
        setIsSubmitting(true)
        const updatedTemplate = {
            ...template.content,
            title: title,
            description: description,
        }
        if (!_.isEqual(updatedTemplate, template.content)) {
            await template.updateContent(updatedTemplate)
        }
        onSubmit && onSubmit()
        setIsSubmitting(false)
    }

    return (
        <Form onSubmit={handleSubmit}>
            <Box height={{ min: '50vh' }} justify="between">
                <Box height={{ min: 'auto' }} pad="xsmall">
                    <FormField
                        name="title"
                        label="Title"
                        validate={[() => isRequired(title)]}
                    >
                        <TextInput
                            placeholder='Short summary of your service, i.e. "English to Spanish Technical Translation."'
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </FormField>
                    <FormField
                        name="description"
                        label="Description"
                        validate={[() => isRequired(description)]}
                    >
                        <TextArea
                            placeholder="Describe your service at length. Communicate your unique value, details of your service, and the format and content of information you need from customers. Customers will send proposals in response to this description."
                            rows={15}
                            resize={false}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
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
                            onClick={
                                onCancel
                                    ? onCancel
                                    : () => window.alert('Todo Reset Template')
                            }
                        />
                    }
                />
            </Box>
        </Form>
    )
}

export default TemplateDescriptionForm
