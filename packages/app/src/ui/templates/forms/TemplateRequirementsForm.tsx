import {
    Box,
    Button,
    Form,
    FormExtendedEvent,
    FormField,
    TextArea,
} from 'grommet'

import BaseSkeletonBox from '@cambrian/app/components/skeletons/BaseSkeletonBox'
import { EditTemplatePropsType } from '@cambrian/app/hooks/useEditTemplate'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import TwoButtonWrapContainer from '@cambrian/app/components/containers/TwoButtonWrapContainer'
import { useState } from 'react'

interface TemplateRequirementsFormProps {
    editTemplateProps: EditTemplatePropsType
    onSubmit?: () => void
    onCancel?: () => void
    submitLabel?: string
    cancelLabel?: string
}

export type TemplateRequirementsFormType = {
    requirements: string
}

const TemplateRequirementsForm = ({
    editTemplateProps,
    onSubmit,
    onCancel,
    submitLabel,
    cancelLabel,
}: TemplateRequirementsFormProps) => {
    const { template, setTemplate, onSaveTemplate, onResetTemplate } =
        editTemplateProps

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
                            placeholder="Example:
                        1. A clear understanding of the purpose of the article
                        2. A list of topics to cover in the article
                        3. An outline of the structure and flow of the article
                        4. Access to relevant research and data to support the article"
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
