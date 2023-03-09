import { Box, Button, Form, FormField, Text, TextInput } from 'grommet'
import React, { useState } from 'react'
import { isAddress, isRequired } from '@cambrian/app/utils/helpers/validation'
import {
    parseInputToSeconds,
    parseSecondsToForm,
} from '@cambrian/app/utils/helpers/timeParsing'

import BaseSkeletonBox from '@cambrian/app/components/skeletons/BaseSkeletonBox'
import ButtonRowContainer from '@cambrian/app/components/containers/ButtonRowContainer'
import { EditProposalContextType } from '@cambrian/app/hooks/useEditProposal'
import { FlexInputFormType } from '../../templates/forms/TemplateFlexInputsForm'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import _ from 'lodash'
import { getFlexInputType } from '@cambrian/app/utils/helpers/flexInputHelpers'

interface ProposalFlexInputsFormProps {
    editProposalContext: EditProposalContextType
    onSubmit?: () => Promise<void>
    onCancel?: () => void
    submitLabel?: string
    cancelLabel?: string
}

const ProposalFlexInputsForm = ({
    editProposalContext,
    onSubmit,
    onCancel,
    submitLabel,
    cancelLabel,
}: ProposalFlexInputsFormProps) => {
    const {
        stageStack,
        proposal,
        setProposal,
        onSaveProposal,
        onResetProposal,
    } = editProposalContext
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [timelock, setTimelock] = useState(
        parseSecondsToForm(
            parseInt(
                proposal?.flexInputs.find(
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

    const handleSubmit = async () => {
        setIsSubmitting(true)
        onSubmit ? await onSubmit() : await onSaveProposal()
        setIsSubmitting(false)
    }

    const updateFlexInput = (idx: number, value: string) => {
        const proposalClone = _.cloneDeep(proposal)
        proposalClone!.flexInputs[idx].value = value
        setProposal(proposalClone)
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

    if (!proposal || !stageStack) {
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
                <Box height={{ min: 'auto' }} pad="xsmall">
                    {proposal.flexInputs.map((flexInput, idx) => {
                        const type = getFlexInputType(
                            stageStack.composition.solvers,
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
                                                    proposal.flexInputs[idx]
                                                        .value
                                                ),
                                            () => {
                                                if (
                                                    type === 'address' &&
                                                    !isAddress(
                                                        proposal.flexInputs[idx]
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
                                            value={flexInput.value}
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
                            label={cancelLabel || 'Reset all changes'}
                            onClick={onCancel ? onCancel : onResetProposal}
                        />
                    }
                />
            </Box>
        </Form>
    )
}

export default ProposalFlexInputsForm
