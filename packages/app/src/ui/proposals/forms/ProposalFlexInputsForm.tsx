import { Box, Button, Form, FormField, Text, TextInput } from 'grommet'
import React, { SetStateAction, useEffect, useState } from 'react'
import {
    getFlexInputDescription,
    getFlexInputInstruction,
    getFlexInputLabel,
    getFlexInputType,
} from '@cambrian/app/utils/helpers/flexInputHelpers'
import { isAddress, isRequired } from '@cambrian/app/utils/helpers/validation'

import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import { ProposalModel } from '@cambrian/app/models/ProposalModel'
import TwoButtonWrapContainer from '@cambrian/app/components/containers/TwoButtonWrapContainer'
import _ from 'lodash'
import useEditProposal from '@cambrian/app/hooks/useEditProposal'
import BaseSkeletonBox from '@cambrian/app/components/skeletons/BaseSkeletonBox'

interface ProposalFlexInputsFormProps {
    onSubmit?: () => Promise<void>
    onCancel?: () => void
    submitLabel?: string
    cancelLabel?: string
}

const ProposalFlexInputsForm = ({
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
    } = useEditProposal()
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        return () => {}
    }, [])

    const handleSubmit = async () => {
        setIsSubmitting(true)
        onSubmit ? await onSubmit() : await onSaveProposal()
        setIsSubmitting(false)
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
                            flexInput.isFlex === 'None' ||
                            flexInput.isFlex === 'Template'
                        ) {
                            return null
                        } else {
                            return (
                                <Box key={idx}>
                                    <FormField
                                        name={`flexInputs[${idx}].value`}
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
                                            onChange={(e) => {
                                                const inputsClone =
                                                    _.cloneDeep(proposal)

                                                inputsClone.flexInputs[
                                                    idx
                                                ].value = e.target.value

                                                setProposal(inputsClone)
                                            }}
                                        />
                                    </FormField>
                                    <Text
                                        size="small"
                                        color="dark-4"
                                        margin={{ bottom: 'small' }}
                                    >
                                        {flexInput.description}
                                    </Text>
                                    <Text
                                        size="small"
                                        color="dark-4"
                                        margin={{ bottom: 'small' }}
                                    >
                                        {flexInput.instruction}
                                    </Text>
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
                            onClick={onCancel ? onCancel : onResetProposal}
                        />
                    }
                />
            </Box>
        </Form>
    )
}

export default ProposalFlexInputsForm
