import {
    Box,
    Button,
    Form,
    FormExtendedEvent,
    FormField,
    Text,
    TextInput,
} from 'grommet'
import { SetStateAction, useEffect, useState } from 'react'
import {
    getFlexInputDescription,
    getFlexInputInstruction,
    getFlexInputLabel,
    getFlexInputType,
} from '@cambrian/app/utils/helpers/flexInputHelpers'

import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import { TaggedInput } from '@cambrian/app/models/SlotTagModel'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import TwoButtonWrapContainer from '@cambrian/app/components/containers/TwoButtonWrapContainer'
import _ from 'lodash'
import { isAddress } from 'ethers/lib/utils'
import useEditTemplate from '@cambrian/app/hooks/useEditTemplate'

interface TemplateFlexInputsFormProps {
    submitLabel?: string
    cancelLabel?: string
}

export type FlexInputFormType = TaggedInput & {
    solverId: string
    tagId: string
}

const TemplateFlexInputsForm = ({
    submitLabel,
    cancelLabel,
}: TemplateFlexInputsFormProps) => {
    const {
        template,
        composition,
        setTemplate,
        onSaveTemplate,
        onResetTemplate,
    } = useEditTemplate()

    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        return () => {}
    }, [])

    const handleSubmit = async (
        event: FormExtendedEvent<FlexInputFormType[], Element>
    ) => {
        event.preventDefault()
        setIsSubmitting(true)
        await onSaveTemplate()
        setIsSubmitting(false)
    }

    if (!template || !composition) {
        return null
    }

    return (
        <Form onSubmit={handleSubmit}>
            <Box height={{ min: '50vh' }} justify="between">
                <Box pad="xsmall">
                    {template.flexInputs.map((flexInput, idx) => {
                        const type = getFlexInputType(
                            composition.solvers,
                            flexInput
                        )

                        if (flexInput.isFlex == 'None' || 'Proposal') {
                            return null
                        } else {
                            return (
                                <Box key={idx}>
                                    <FormField
                                        name={`flexInput[${idx}].value`}
                                        label={flexInput.label}
                                        validate={[
                                            () => {
                                                if (
                                                    template.flexInputs[
                                                        idx
                                                    ].value.trim().length === 0
                                                ) {
                                                    return undefined
                                                } else if (
                                                    type === 'address' &&
                                                    !isAddress(
                                                        template.flexInputs[idx]
                                                            .value
                                                    )
                                                ) {
                                                    return 'Invalid Address'
                                                }
                                            },
                                        ]}
                                    >
                                        <TextInput
                                            type={type}
                                            value={
                                                template.flexInputs[idx].value
                                            }
                                            onChange={(e) => {
                                                const templateClone =
                                                    _.cloneDeep(template)

                                                templateClone.flexInputs[
                                                    idx
                                                ].value = e.target.value

                                                setTemplate(templateClone)
                                            }}
                                        />
                                    </FormField>
                                    {flexInput.description && (
                                        <Text
                                            size="small"
                                            color="dark-4"
                                            margin={{ bottom: 'small' }}
                                        >
                                            {flexInput.description}
                                        </Text>
                                    )}
                                    {flexInput.instruction && (
                                        <Text
                                            size="small"
                                            color="dark-4"
                                            margin={{ bottom: 'small' }}
                                        >
                                            {flexInput.instruction}
                                        </Text>
                                    )}
                                </Box>
                            )
                        }
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
                            onClick={onResetTemplate}
                        />
                    }
                />
            </Box>
        </Form>
    )
}

export default TemplateFlexInputsForm
