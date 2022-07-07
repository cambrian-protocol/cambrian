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

interface TemplateRequirementsFormProps {
    templateInput: CeramicTemplateModel
    setTemplateInput: React.Dispatch<
        SetStateAction<CeramicTemplateModel | undefined>
    >
    onSubmit: () => Promise<void>
    submitLabel?: string
    onCancel: () => void
    cancelLabel?: string
}

export type TemplateRequirementsFormType = {
    requirements: string
}

const TemplateRequirementsForm = ({
    templateInput,
    setTemplateInput,
    onSubmit,
    submitLabel,
    onCancel,
    cancelLabel,
}: TemplateRequirementsFormProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        return () => {}
    }, [])

    const handleSubmit = async (
        event: FormExtendedEvent<TemplateRequirementsFormType, Element>
    ) => {
        event.preventDefault()
        setIsSubmitting(true)
        await onSubmit()
        setIsSubmitting(false)
    }

    return (
        <Form<TemplateRequirementsFormType> onSubmit={handleSubmit}>
            <Box height="50vh" justify="between">
                <FormField label="Requirements" name="requirements">
                    <TextArea
                        value={templateInput.requirements}
                        resize={false}
                        rows={10}
                        onChange={(e) =>
                            setTemplateInput({
                                ...templateInput,
                                requirements: e.target.value,
                            })
                        }
                    />
                </FormField>
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

export default TemplateRequirementsForm
