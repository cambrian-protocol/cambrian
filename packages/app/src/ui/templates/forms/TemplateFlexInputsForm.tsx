import {
    Box,
    Button,
    Form,
    FormExtendedEvent,
    FormField,
    Text,
    TextInput,
} from 'grommet'
import {
    parseInputToSeconds,
    parseSecondsToForm,
} from '@cambrian/app/utils/helpers/timeParsing'

import ButtonRowContainer from '@cambrian/app/components/containers/ButtonRowContainer'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import { TaggedInput } from '@cambrian/app/src/classes/Tags/SlotTag'
import Template from '@cambrian/app/classes/stages/Template'
import _ from 'lodash'
import { getFlexInputType } from '@cambrian/app/utils/helpers/flexInputHelpers'
import { isAddress } from 'ethers/lib/utils'
import { useState } from 'react'

interface TemplateFlexInputsFormProps {
    template: Template
    compositionContent: CompositionModel
    onSubmit?: () => void
    onCancel?: () => void
    submitLabel?: string
    cancelLabel?: string
}

export type FlexInputFormType = TaggedInput & {
    solverId: string
    tagId: string
}

const TemplateFlexInputsForm = ({
    template,
    compositionContent,
    onSubmit,
    onCancel,
    submitLabel,
    cancelLabel,
}: TemplateFlexInputsFormProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [flexInputs, setFlexInputs] = useState(template.content.flexInputs)
    const [timelock, setTimelock] = useState(
        parseSecondsToForm(
            parseInt(
                template.content.flexInputs.find(
                    (fi) => fi.slotId === 'timelockSeconds'
                )?.value || '0'
            )
        )
    )

    const onChangeTime = ({
        days,
        hours,
        minutes,
    }: {
        days?: number
        hours?: number
        minutes?: number
    }) => {
        const newTime = parseSecondsToForm(
            (days !== undefined ? days : timelock.days) * 24 * 60 * 60 +
                (hours !== undefined ? hours : timelock.hours) * 60 * 60 +
                (minutes !== undefined ? minutes : timelock.minutes) * 60
        )

        setTimelock(newTime)
        return newTime
    }

    const handleSubmit = async (
        event: FormExtendedEvent<FlexInputFormType[], Element>
    ) => {
        try {
            event.preventDefault()
            setIsSubmitting(true)
            const updatedTemplate = {
                ...template.content,
                flexInputs: flexInputs,
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
        setFlexInputs(template.content.flexInputs)
        setTimelock(
            parseSecondsToForm(
                parseInt(
                    template.content.flexInputs.find(
                        (fi) => fi.slotId === 'timelockSeconds'
                    )?.value || '0'
                )
            )
        )
    }

    const updateFlexInput = (idx: number, value: string) => {
        const updatedFlexInputs = _.cloneDeep(flexInputs)
        updatedFlexInputs[idx].value = value
        setFlexInputs(updatedFlexInputs)
    }

    const renderTimelockSecondsForm = (
        flexInput: FlexInputFormType,
        idx: number
    ) => {
        return (
            <Box key={idx} pad={{ bottom: 'medium' }}>
                <Box direction="row" gap="small" align="center">
                    <FormField
                        label="Timelock Days"
                        margin={{ bottom: 'small' }}
                    >
                        <TextInput
                            type="number"
                            name="timelockDays"
                            value={timelock.days}
                            onChange={(e) => {
                                if (parseInt(e.target.value) >= 0) {
                                    const newTime = onChangeTime({
                                        days: parseInt(e.target.value),
                                    })
                                    updateFlexInput(
                                        idx,
                                        parseInputToSeconds(newTime).toString()
                                    )
                                }
                            }}
                        />
                    </FormField>
                    <FormField label="Hours" margin={{ bottom: 'small' }}>
                        <TextInput
                            type="number"
                            name="timelockHours"
                            value={timelock.hours}
                            onChange={(e) => {
                                if (parseInt(e.target.value) >= 0) {
                                    const newTime = onChangeTime({
                                        hours: parseInt(e.target.value),
                                    })
                                    updateFlexInput(
                                        idx,
                                        parseInputToSeconds(newTime).toString()
                                    )
                                }
                            }}
                        />
                    </FormField>
                    <FormField label="Minutes" margin={{ bottom: 'small' }}>
                        <TextInput
                            type="number"
                            name="timelockMinutes"
                            value={timelock.minutes}
                            onChange={(e) => {
                                if (parseInt(e.target.value) >= 0) {
                                    const newTime = onChangeTime({
                                        minutes: parseInt(e.target.value),
                                    })
                                    updateFlexInput(
                                        idx,
                                        parseInputToSeconds(newTime).toString()
                                    )
                                }
                            }}
                        />
                    </FormField>
                </Box>
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

    return (
        <Form onSubmit={handleSubmit}>
            <Box gap="medium">
                <Box gap="medium">
                    {flexInputs.map((flexInput, idx) => {
                        const type = getFlexInputType(
                            compositionContent.solvers,
                            flexInput
                        )

                        if (
                            flexInput.isFlex === 'Template' ||
                            flexInput.isFlex === 'Both'
                        ) {
                            if (flexInput.slotId === 'timelockSeconds') {
                                return renderTimelockSecondsForm(flexInput, idx)
                            }

                            return (
                                <Box key={idx}>
                                    <FormField
                                        name={`${flexInput.slotId}`}
                                        label={flexInput.label}
                                        validate={[
                                            () => {
                                                if (
                                                    flexInputs[idx].value.trim()
                                                        .length === 0
                                                ) {
                                                    if (
                                                        flexInput.isFlex ===
                                                        'Template'
                                                    ) {
                                                        return 'Required'
                                                    }
                                                } else if (
                                                    type === 'address' &&
                                                    !isAddress(
                                                        flexInputs[idx].value
                                                    )
                                                ) {
                                                    return 'Invalid Address'
                                                }
                                            },
                                        ]}
                                    >
                                        <TextInput
                                            type={type}
                                            value={flexInputs[idx].value}
                                            onChange={(e) =>
                                                updateFlexInput(
                                                    idx,
                                                    e.target.value
                                                )
                                            }
                                            placeholder={flexInput.instruction}
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
                                </Box>
                            )
                        } else {
                            return null
                        }
                    })}
                </Box>
                <ButtonRowContainer
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

export default TemplateFlexInputsForm
