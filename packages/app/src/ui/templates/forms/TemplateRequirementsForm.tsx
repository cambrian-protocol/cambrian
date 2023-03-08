import {
    Box,
    Button,
    Form,
    FormExtendedEvent,
    FormField,
    TextArea,
} from 'grommet'

import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import Template from '@cambrian/app/classes/stages/Template'
import TwoButtonWrapContainer from '@cambrian/app/components/containers/TwoButtonWrapContainer'
import _ from 'lodash'
import { useState } from 'react'

interface TemplateRequirementsFormProps {
    template: Template
    onSubmit?: () => void
    onCancel?: () => void
    submitLabel?: string
    cancelLabel?: string
}

export type TemplateRequirementsFormType = {
    requirements: string
}

const TemplateRequirementsForm = ({
    template,
    onSubmit,
    onCancel,
    submitLabel,
    cancelLabel,
}: TemplateRequirementsFormProps) => {
    const [requirements, setRequirements] = useState(
        template.content.requirements
    )
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (
        event: FormExtendedEvent<TemplateRequirementsFormType, Element>
    ) => {
        try {
            event.preventDefault()
            setIsSubmitting(true)
            const updatedTemplate = {
                ...template.content,
                requirements: requirements,
            }
            if (!_.isEqual(updatedTemplate, template.content)) {
                await template.updateContent(updatedTemplate)
            }
            onSubmit && onSubmit()
            setIsSubmitting(false)
        } catch (e) {
            console.error(e)
        }
    }

    const onReset = () => {
        setRequirements(template.content.requirements)
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
                            value={requirements}
                            resize={false}
                            rows={10}
                            onChange={(e) => setRequirements(e.target.value)}
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
                            label={cancelLabel || 'Reset changes'}
                            onClick={onCancel ? onCancel : onReset}
                        />
                    }
                />
            </Box>
        </Form>
    )
}

export default TemplateRequirementsForm
