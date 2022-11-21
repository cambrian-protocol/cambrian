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
import { EditTemplateContextType } from '@cambrian/app/hooks/useEditTemplate'
import BaseSkeletonBox from '@cambrian/app/components/skeletons/BaseSkeletonBox'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'

export type TemplateDescriptionFormType = {
    title: string
    description: string
}
interface TemplateDescriptionFormProps {
    editTemplateContext: EditTemplateContextType
    onSubmit?: () => void
    onCancel?: () => void
    submitLabel?: string
    cancelLabel?: string
}

const TemplateDescriptionForm = ({
    editTemplateContext,
    onSubmit,
    onCancel,
    submitLabel,
    cancelLabel,
}: TemplateDescriptionFormProps) => {
    const { template, setTemplate, onSaveTemplate, onResetTemplate } =
        editTemplateContext

    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (
        event: FormExtendedEvent<TemplateDescriptionFormType, Element>
    ) => {
        event.preventDefault()
        setIsSubmitting(true)
        onSubmit ? await onSubmit() : await onSaveTemplate()
        setIsSubmitting(false)
    }

    if (!template) {
        return (
            <Box height="large" gap="medium">
                <BaseSkeletonBox height={'xxsmall'} width={'100%'} />
                <BaseSkeletonBox height={'small'} width={'100%'} />
            </Box>
        )
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
                            onClick={onCancel ? onCancel : onResetTemplate}
                        />
                    }
                />
            </Box>
        </Form>
    )
}

export default TemplateDescriptionForm
