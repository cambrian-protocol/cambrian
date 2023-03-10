import {
    Box,
    Button,
    Form,
    FormExtendedEvent,
    FormField,
    Text,
    TextInput,
} from 'grommet'
import React, { useState } from 'react'
import { isAddress, isRequired } from '@cambrian/app/utils/helpers/validation'
import {
    parseInputToSeconds,
    parseSecondsToForm,
} from '@cambrian/app/utils/helpers/timeParsing'

import ButtonRowContainer from '@cambrian/app/components/containers/ButtonRowContainer'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { FlexInputFormType } from '../../templates/forms/TemplateFlexInputsForm'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import Proposal from '@cambrian/app/classes/stages/Proposal'
import _ from 'lodash'
import { getFlexInputType } from '@cambrian/app/utils/helpers/flexInputHelpers'

interface ProposalFlexInputsFormProps {
    proposal: Proposal
    compositionContent: CompositionModel
    onSubmit?: () => void
    onCancel?: () => void
    submitLabel?: string
    cancelLabel?: string
}

const ProposalFlexInputsForm = ({
    proposal,
    compositionContent,
    onSubmit,
    onCancel,
    submitLabel,
    cancelLabel,
}: ProposalFlexInputsFormProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [flexInputs, setFlexInputs] = useState(proposal.content.flexInputs)

    const [timelock, setTimelock] = useState(
        parseSecondsToForm(
            parseInt(
                proposal.content.flexInputs.find(
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
            const updatedProposal = {
                ...proposal.content,
                flexInputs: flexInputs,
            }
            if (!_.isEqual(updatedProposal, proposal.content)) {
                await proposal.updateContent(updatedProposal)
            }
            onSubmit && onSubmit()
            setIsSubmitting(false)
        } catch (e) {
            console.error(e)
        }
    }

    const onReset = () => {
        setFlexInputs(proposal.content.flexInputs)
        setTimelock(
            parseSecondsToForm(
                parseInt(
                    proposal.content.flexInputs.find(
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
                    {proposal.content.flexInputs.map((flexInput, idx) => {
                        const type = getFlexInputType(
                            compositionContent.solvers,
                            flexInput
                        )
                        if (
                            flexInput.isFlex === 'Proposal' ||
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
                                            () =>
                                                isRequired(
                                                    flexInputs[idx].value
                                                ),
                                            () => {
                                                if (
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
                                    <Text
                                        size="small"
                                        color="dark-4"
                                        margin={{ bottom: 'small' }}
                                    >
                                        {flexInput.description}
                                    </Text>
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

export default ProposalFlexInputsForm
