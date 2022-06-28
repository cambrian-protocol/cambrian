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

interface TemplateRequirementsFormProps {
    input: TemplateFormType
    onSubmit: (
        event: FormExtendedEvent<TemplateRequirementsFormType, Element>
    ) => Promise<void>
    onCancel: () => void
    submitLabel: string
    cancelLabel: string
}

export type TemplateRequirementsFormType = {
    requirements: string
}

const TemplateRequirementsForm = ({
    input,
    onSubmit,
    onCancel,
    submitLabel,
    cancelLabel,
}: TemplateRequirementsFormProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [requirements, setRequirements] = useState('')

    useEffect(() => {
        setRequirements(input.requirements)
    }, [input])

    const handleSubmit = async (
        e: FormExtendedEvent<TemplateRequirementsFormType, Element>
    ) => {
        setIsSubmitting(true)
        await onSubmit(e)
        setIsSubmitting(false)
    }

    return (
        <Form<TemplateRequirementsFormType> onSubmit={handleSubmit}>
            <Box height={{ min: '60vh' }} justify="between">
                <Box>
                    <HeaderTextSection
                        title="Requirements"
                        paragraph="Information to help buyers provide you with exactly what you need to start working on their order."
                    />
                    <FormField label="Requirements" name="requirements">
                        <TextArea
                            name="requirements"
                            value={requirements}
                            resize={false}
                            rows={10}
                            onChange={(e) => setRequirements(e.target.value)}
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

export default TemplateRequirementsForm
