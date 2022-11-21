import {
    Box,
    Button,
    Form,
    FormExtendedEvent,
    FormField,
    TextArea,
} from 'grommet'
import { useState } from 'react'

import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import TwoButtonWrapContainer from '@cambrian/app/components/containers/TwoButtonWrapContainer'
import { EditTemplateContextType } from '@cambrian/app/hooks/useEditTemplate'
import BaseSkeletonBox from '@cambrian/app/components/skeletons/BaseSkeletonBox'

interface TemplateRequirementsFormProps {
    editTemplateContext: EditTemplateContextType
    onSubmit?: () => void
    onCancel?: () => void
    submitLabel?: string
    cancelLabel?: string
}

export type TemplateRequirementsFormType = {
    requirements: string
}

const TemplateRequirementsForm = ({
    editTemplateContext,
    onSubmit,
    onCancel,
    submitLabel,
    cancelLabel,
}: TemplateRequirementsFormProps) => {
    const { template, setTemplate, onSaveTemplate, onResetTemplate } =
        editTemplateContext

    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (
        event: FormExtendedEvent<TemplateRequirementsFormType, Element>
    ) => {
        event.preventDefault()
        setIsSubmitting(true)
        onSubmit ? await onSubmit() : await onSaveTemplate()
        setIsSubmitting(false)
    }

    if (!template) {
        return (
            <Box height="large" gap="medium">
                <BaseSkeletonBox height={'small'} width={'100%'} />
            </Box>
        )
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
                            onClick={onCancel ? onCancel : onResetTemplate}
                        />
                    }
                />
            </Box>
        </Form>
    )
}

export default TemplateRequirementsForm
