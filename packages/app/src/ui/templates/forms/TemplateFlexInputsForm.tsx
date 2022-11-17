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

interface TemplateFlexInputsFormProps {
    composition: CompositionModel
    templateInput: TemplateModel
    setTemplateInput: React.Dispatch<SetStateAction<TemplateModel | undefined>>
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
        <Form onSubmit={handleSubmit}>
            <Box height={{ min: '50vh' }} justify="between">
                <Box pad="xsmall">
                    {templateInput.flexInputs.map((flexInput, idx) => {
                        const type = getFlexInputType(
                            composition.solvers,
                            flexInput
                        )

                        const label = getFlexInputLabel(flexInput)
                        const description = getFlexInputDescription(flexInput)
                        const instruction = getFlexInputInstruction(flexInput)

                        if (
                            !flexInput.isFlex ||
                            flexInput.isFlex === 'None' ||
                            flexInput.isFlex === 'Proposal'
                        ) {
                            return null
                        } else {
                            return (
                                <Box key={idx}>
                                    <FormField
                                        name={`flexInput[${idx}].value`}
                                        label={label}
                                        validate={[
                                            () => {
                                                if (
                                                    templateInput.flexInputs[
                                                        idx
                                                    ].value.trim().length === 0
                                                ) {
                                                    return undefined
                                                } else if (
                                                    type === 'address' &&
                                                    !isAddress(
                                                        templateInput
                                                            .flexInputs[idx]
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
                                                templateInput.flexInputs[idx]
                                                    .value
                                            }
                                            onChange={(e) => {
                                                const inputsClone =
                                                    _.cloneDeep(templateInput)

                                                inputsClone.flexInputs[
                                                    idx
                                                ].value = e.target.value

                                                setTemplateInput(inputsClone)
                                            }}
                                        />
                                    </FormField>
                                    {description && (
                                        <Text
                                            size="small"
                                            color="dark-4"
                                            margin={{ bottom: 'small' }}
                                        >
                                            {description}
                                        </Text>
                                    )}
                                    {instruction && (
                                        <Text
                                            size="small"
                                            color="dark-4"
                                            margin={{ bottom: 'small' }}
                                        >
                                            {instruction}
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
                            onClick={onCancel}
                        />
                    }
                />
            </Box>
        </Form>
    )
}

export default TemplateFlexInputsForm
