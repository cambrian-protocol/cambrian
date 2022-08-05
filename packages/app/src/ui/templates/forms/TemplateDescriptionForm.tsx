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

import { CeramicTemplateModel } from '@cambrian/app/models/TemplateModel'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import TwoButtonWrapContainer from '@cambrian/app/components/containers/TwoButtonWrapContainer'
import { isRequired } from '@cambrian/app/utils/helpers/validation'

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
        <Form onSubmit={handleSubmit}>
            <Box height={{ min: '50vh' }} justify="between">
                <Box height={{ min: 'auto' }} pad="xsmall">
                    <FormField
                        name="title"
                        label="Title"
                        validate={[() => isRequired(templateInput.title)]}
                    >
                        <TextInput
                            placeholder='Short summary of your service, i.e. "English to Spanish Technical Translation."'
                            value={templateInput.title}
                            onChange={(e) =>
                                setTemplateInput({
                                    ...templateInput,
                                    title: e.target.value,
                                })
                            }
                        />
                    </FormField>
                    <FormField
                        name="description"
                        label="Description"
                        validate={[() => isRequired(templateInput.description)]}
                    >
                        <TextArea
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

export default TemplateDescriptionForm
