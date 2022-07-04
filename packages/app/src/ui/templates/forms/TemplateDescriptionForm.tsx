import {
    Box,
    Button,
    Form,
    FormExtendedEvent,
    FormField,
    TextArea,
} from 'grommet'
import { SetStateAction, useEffect, useState } from 'react'

import { CeramicTemplateModel } from '@cambrian/app/models/TemplateModel'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'

interface TemplateDescriptionFormProps {
    templateInput: CeramicTemplateModel
    setTemplateInput: React.Dispatch<
        SetStateAction<CeramicTemplateModel | undefined>
    >
    onSubmit: () => Promise<void>
    submitLabel?: string
    onCancel: () => void
    cancelLabel?: string
}

export type TemplateDescriptionFormType = {
    title: string
    description: string
}

const TemplateDescriptionForm = ({
    templateInput,
    setTemplateInput,
    onSubmit,
    submitLabel,
    onCancel,
    cancelLabel,
}: TemplateDescriptionFormProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        return () => {}
    }, [])

    const handleSubmit = async (
        event: FormExtendedEvent<TemplateDescriptionFormType, Element>
    ) => {
        event.preventDefault()
        setIsSubmitting(true)
        await onSubmit()
        setIsSubmitting(false)
    }

    return (
        <Form<TemplateDescriptionFormType> onSubmit={handleSubmit}>
            <Box height="50vh" justify="between">
                <Box>
                    <FormField
                        name="title"
                        label="Title"
                        required
                        placeholder='Short summary of your service, i.e. "English to Spanish Technical Translation."'
                        value={templateInput.title}
                        onChange={(e) =>
                            setTemplateInput({
                                ...templateInput,
                                title: e.target.value,
                            })
                        }
                    />
                    <FormField name="description" label="Description" required>
                        <TextArea
                            name="description"
                            placeholder="Describe your service at length. Communicate your unique value, details of your service, and the format and content of information you need from customers. Customers will send proposals in response to this description."
                            rows={15}
                            resize={false}
                            value={templateInput.description}
                            onChange={(e) =>
                                setTemplateInput({
                                    ...templateInput,
                                    description: e.target.value,
                                })
                            }
                        />
                    </FormField>
                </Box>
                <Box direction="row" justify="between">
                    <Button
                        size="small"
                        secondary
                        label={cancelLabel || 'Reset all changes'}
                        onClick={onCancel}
                    />
                    <LoaderButton
                        isLoading={isSubmitting}
                        size="small"
                        primary
                        label={submitLabel || 'Save'}
                        type="submit"
                    />
                </Box>
            </Box>
        </Form>
    )
}

export default TemplateDescriptionForm
