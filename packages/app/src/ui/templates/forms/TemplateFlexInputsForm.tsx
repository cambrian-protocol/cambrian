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

import BaseSkeletonBox from '@cambrian/app/components/skeletons/BaseSkeletonBox'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import { TaggedInput } from '@cambrian/app/models/SlotTagModel'
import TwoButtonWrapContainer from '@cambrian/app/components/containers/TwoButtonWrapContainer'
import _ from 'lodash'
import { getFlexInputType } from '@cambrian/app/utils/helpers/flexInputHelpers'
import { isAddress } from 'ethers/lib/utils'
import useEditTemplate from '@cambrian/app/hooks/useEditTemplate'
import { useState } from 'react'

interface TemplateFlexInputsFormProps {
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
    onSubmit,
    onCancel,
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
    const [timelock, setTimelock] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
    })

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
        event.preventDefault()
        setIsSubmitting(true)
        onSubmit ? await onSubmit() : await onSaveTemplate()
        setIsSubmitting(false)
    }

    const updateFlexInput = (idx: number, value: string) => {
        const templateClone = _.cloneDeep(template)
        templateClone!.flexInputs[idx].value = value
        setTemplate(templateClone)
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

    if (!template || !composition) {
        return (
            <Box height="large" gap="medium">
                <BaseSkeletonBox height={'xxsmall'} width={'100%'} />
                <BaseSkeletonBox height={'small'} width={'100%'} />
                <BaseSkeletonBox height={'xxsmall'} width={'100%'} />
                <BaseSkeletonBox height={'small'} width={'100%'} />
            </Box>
        )
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

                        if (
                            flexInput.isFlex === 'Template' ||
                            flexInput.isFlex === 'Both'
                        ) {
                            if (flexInput.slotId === 'timelockSeconds') {
                                return renderTimelockSecondsForm(flexInput, idx)
                            }

                            return (
                                <Box key={idx} pad={{ bottom: 'medium' }}>
                                    <FormField
                                        name={`${flexInput.slotId}`}
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
                                            onChange={(e) =>
                                                updateFlexInput(
                                                    idx,
                                                    e.target.value
                                                )
                                            }
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
                        } else {
                            return null
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
                            onClick={onCancel ? onCancel : onResetTemplate}
                        />
                    }
                />
            </Box>
        </Form>
    )
}

export default TemplateFlexInputsForm
