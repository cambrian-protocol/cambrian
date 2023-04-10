import { Box, FormField, Text, TextInput } from 'grommet'
import React, { SetStateAction, useState } from 'react'
import { isAddress, isRequired } from '@cambrian/app/utils/helpers/validation'
import {
    parseInputToSeconds,
    parseSecondsToForm,
} from '@cambrian/app/utils/helpers/timeParsing'

import { FlexInputFormType } from '../../templates/forms/TemplateFlexInputsForm'
import Proposal from '@cambrian/app/classes/stages/Proposal'
import { ProposalInputType } from '../EditProposalUI'
import _ from 'lodash'
import { getFlexInputType } from '@cambrian/app/utils/helpers/flexInputHelpers'

interface ProposalFlexInputsFormProps {
    disabled?: boolean
    proposal: Proposal
    proposalInput: ProposalInputType
    setProposalInput: React.Dispatch<SetStateAction<ProposalInputType>>
}

const ProposalFlexInputsForm = ({
    disabled,
    proposal,
    proposalInput,
    setProposalInput,
}: ProposalFlexInputsFormProps) => {
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

    const updateFlexInput = (idx: number, value: string) => {
        const updatedFlexInputs = _.cloneDeep(proposalInput.flexInputs)
        updatedFlexInputs[idx].value = value
        setProposalInput({ ...proposalInput, flexInputs: updatedFlexInputs })
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
                            disabled={disabled}
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
                            disabled={disabled}
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
                            disabled={disabled}
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
        <Box gap="medium" margin={{ bottom: 'small' }}>
            {proposal.content.flexInputs.map((flexInput, idx) => {
                const type = getFlexInputType(
                    proposal.compositionDoc.content.solvers,
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
                                            proposalInput.flexInputs[idx].value
                                        ),
                                    () => {
                                        if (
                                            type === 'address' &&
                                            !isAddress(
                                                proposalInput.flexInputs[idx]
                                                    .value
                                            )
                                        ) {
                                            return 'Invalid Address'
                                        }
                                    },
                                ]}
                            >
                                <TextInput
                                    disabled={disabled}
                                    type={type}
                                    value={proposalInput.flexInputs[idx].value}
                                    onChange={(e) =>
                                        updateFlexInput(idx, e.target.value)
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
    )
}

export default ProposalFlexInputsForm
