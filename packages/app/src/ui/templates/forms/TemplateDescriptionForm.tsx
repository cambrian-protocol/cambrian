import {
    Box,
    Button,
    Form,
    FormExtendedEvent,
    FormField,
    TextArea,
} from 'grommet'
import { useEffect, useState } from 'react'

import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import { TemplateFormType } from '../wizard/TemplateWizard'

interface TemplateDescriptionFormProps {
    input: TemplateFormType
    onSubmit: (
        event: FormExtendedEvent<TemplateDescriptionFormType, Element>
    ) => Promise<void>
    submitLabel: string
    onCancel: () => void
    cancelLabel: string
}

export type TemplateDescriptionFormType = {
    title: string
    description: string
}

const TemplateDescriptionForm = ({
    input,
    onSubmit,
    submitLabel,
    cancelLabel,
    onCancel,
}: TemplateDescriptionFormProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [title, setTitle] = useState<string>('')
    const [description, setDescription] = useState<string>('')

    useEffect(() => {
        setTitle(input.title)
        setDescription(input.description)
    }, [input])

    const handleSubmit = async (
        e: FormExtendedEvent<TemplateDescriptionFormType, Element>
    ) => {
        setIsSubmitting(true)
        await onSubmit(e)
        setIsSubmitting(false)
    }

    return (
        <Form<TemplateDescriptionFormType> onSubmit={handleSubmit}>
            <Box height={{ min: '60vh' }} justify="between">
                <Box>
                    <HeaderTextSection
                        title={`What service are you offering?`}
                        paragraph="Let the world know how you can help."
                    />
                    <FormField
                        name="title"
                        label="Title"
                        required
                        placeholder='Short summary of your service, i.e. "English to Spanish Technical Translation."'
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <FormField name="description" label="Description" required>
                        <TextArea
                            name="description"
                            placeholder="Describe your service at length. Communicate your unique value, details of your service, and the format and content of information you need from customers. Customers will send proposals in response to this description."
                            rows={15}
                            resize={false}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </FormField>
                </Box>
                <Box direction="row" justify="between">
                    <Button
                        size="small"
                        secondary
                        label={cancelLabel}
                        onClick={onCancel}
                    />
                    <LoaderButton
                        isLoading={isSubmitting}
                        size="small"
                        primary
                        label={submitLabel}
                        type="submit"
                    />
                </Box>
            </Box>
        </Form>
    )
}

export default TemplateDescriptionForm
