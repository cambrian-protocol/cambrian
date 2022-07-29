import { Box, Button, Form, FormExtendedEvent, FormField, Text } from 'grommet'
import { SetStateAction, useEffect, useState } from 'react'

import { CeramicTemplateModel } from '@cambrian/app/models/TemplateModel'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import { TaggedInput } from '@cambrian/app/models/SlotTagModel'
import TwoButtonWrapContainer from '@cambrian/app/components/containers/TwoButtonWrapContainer'
import _ from 'lodash'
import { getFlexInputType } from '@cambrian/app/utils/helpers/flexInputHelpers'

interface TemplateFlexInputsFormProps {
    composition: CompositionModel
    templateInput: CeramicTemplateModel
    setTemplateInput: React.Dispatch<
        SetStateAction<CeramicTemplateModel | undefined>
    >
    onSubmit: () => Promise<void>
    submitLabel?: string
    onCancel: () => void
    cancelLabel?: string
}

export type FlexInputFormType = TaggedInput & {
    solverId: string
    tagId: string
}

const TemplateFlexInputsForm = ({
    composition,
    onSubmit,
    templateInput,
    setTemplateInput,
    submitLabel,
    onCancel,
    cancelLabel,
}: TemplateFlexInputsFormProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        return () => {}
    }, [])

    const handleSubmit = async (
        event: FormExtendedEvent<FlexInputFormType[], Element>
    ) => {
        event.preventDefault()
        setIsSubmitting(true)
        await onSubmit()
        setIsSubmitting(false)
    }

    return (
        <Form<FlexInputFormType[]> onSubmit={handleSubmit}>
            <Box height={{ min: '50vh' }} justify="between">
                <Box pad="xsmall">
                    {templateInput.flexInputs.map((flexInput, idx) => {
                        // Keeping collateralToken out as it is handled previously on its own
                        const type = getFlexInputType(
                            composition.solvers,
                            flexInput
                        )
                        return (
                            <Box key={idx}>
                                <FormField
                                    label={flexInput.label}
                                    type={type}
                                    value={templateInput.flexInputs[idx].value}
                                    onChange={(e) => {
                                        const inputsClone =
                                            _.cloneDeep(templateInput)

                                        inputsClone.flexInputs[idx].value =
                                            e.target.value

                                        setTemplateInput(inputsClone)
                                    }}
                                />
                                {flexInput.description !== '' && (
                                    <Text size="small" color="dark-4">
                                        {flexInput.description}
                                    </Text>
                                )}
                            </Box>
                        )
                    })}
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

export default TemplateFlexInputsForm
