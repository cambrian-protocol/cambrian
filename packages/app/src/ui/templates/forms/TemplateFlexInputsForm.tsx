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

import { CeramicTemplateModel } from '@cambrian/app/models/TemplateModel'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import { TaggedInput } from '@cambrian/app/models/SlotTagModel'
import TwoButtonWrapContainer from '@cambrian/app/components/containers/TwoButtonWrapContainer'
import _ from 'lodash'
import { getFlexInputType } from '@cambrian/app/utils/helpers/flexInputHelpers'
import { isAddress } from 'ethers/lib/utils'

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
        <Form onSubmit={handleSubmit}>
            <Box height={{ min: '50vh' }} justify="between">
                <Box pad="xsmall">
                    {templateInput.flexInputs.map((flexInput, idx) => {
                        const type = getFlexInputType(
                            composition.solvers,
                            flexInput
                        )
                        return (
                            <Box key={idx}>
                                <FormField
                                    name={`flexInput[${idx}].value`}
                                    label={flexInput.label}
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
                                                    templateInput.flexInputs[
                                                        idx
                                                    ].value
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
                                            templateInput.flexInputs[idx].value
                                        }
                                        onChange={(e) => {
                                            const inputsClone =
                                                _.cloneDeep(templateInput)

                                            inputsClone.flexInputs[idx].value =
                                                e.target.value

                                            setTemplateInput(inputsClone)
                                        }}
                                    />
                                </FormField>
                                {flexInput.description !== '' && (
                                    <Text
                                        size="small"
                                        color="dark-4"
                                        margin={{ bottom: 'small' }}
                                    >
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
