import { Box, Button, Form, FormExtendedEvent } from 'grommet'
import { useEffect, useState } from 'react'

import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import { TaggedInput } from '@cambrian/app/models/SlotTagModel'
import { TemplateFormType } from '../wizard/TemplateWizard'
import { renderFlexInputs } from '@cambrian/app/utils/helpers/flexInputHelpers'

interface TemplateFlexInputsFormProps {
    onSubmit: (
        e: FormExtendedEvent<TemplateFlexInputStepFormType, Element>
    ) => Promise<void>
    input: TemplateFormType
    composition: CompositionModel
    onCancel: () => void
    submitLabel: string
    cancelLabel: string
}

export type FlexInputFormType = TaggedInput & {
    solverId: string
    tagId: string
}

export type TemplateFlexInputStepFormType = {
    flexInputs: FlexInputFormType[]
}

// TODO Refactor to controlled inputs
const TemplateFlexInputsForm = ({
    onSubmit,
    input,
    composition,
    submitLabel,
    onCancel,
    cancelLabel,
}: TemplateFlexInputsFormProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [flexInputsInput, setFlexInputsInput] =
        useState<TemplateFlexInputStepFormType>({
            flexInputs: [],
        })

    useEffect(() => {
        setFlexInputsInput({
            flexInputs: input.flexInputs,
        })
    }, [input])

    const handleSubmit = async (
        e: FormExtendedEvent<TemplateFlexInputStepFormType, Element>
    ) => {
        setIsSubmitting(true)
        await onSubmit(e)
        setIsSubmitting(false)
    }

    return (
        <Form<TemplateFlexInputStepFormType>
            onChange={(nextValue: TemplateFlexInputStepFormType) => {
                setFlexInputsInput(nextValue)
            }}
            value={flexInputsInput}
            onSubmit={handleSubmit}
        >
            <Box height={{ min: '60vh' }} justify="between">
                <Box>
                    <HeaderTextSection
                        title="Solver Config"
                        paragraph="These fields configure the Solver for you and your service. Leave blank those which should be completed by a customer (e.g. 'Client Address')"
                    />
                    {flexInputsInput.flexInputs.length > 0 &&
                        renderFlexInputs(
                            flexInputsInput.flexInputs,
                            composition.solvers
                        )}
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

export default TemplateFlexInputsForm
