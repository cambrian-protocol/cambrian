import { Box, Button, Form, FormField, Text } from 'grommet'
import React, { SetStateAction, useEffect, useState } from 'react'
import { isAddress, isRequired } from '@cambrian/app/utils/helpers/validation'

import { CeramicProposalModel } from '@cambrian/app/models/ProposalModel'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import TwoButtonWrapContainer from '@cambrian/app/components/containers/TwoButtonWrapContainer'
import _ from 'lodash'
import { getFlexInputType } from '@cambrian/app/utils/helpers/flexInputHelpers'

interface ProposalFlexInputsFormProps {
    proposalInput: CeramicProposalModel
    composition: CompositionModel
    setProposalInput: React.Dispatch<
        SetStateAction<CeramicProposalModel | undefined>
    >
    onSubmit: () => Promise<void>
    submitLabel?: string
    onCancel?: () => void
    cancelLabel?: string
}

const ProposalFlexInputsForm = ({
    proposalInput,
    setProposalInput,
    composition,
    onSubmit,
    submitLabel,
    onCancel,
    cancelLabel,
}: ProposalFlexInputsFormProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        return () => {}
    }, [])

    const handleSubmit = async () => {
        setIsSubmitting(true)
        await onSubmit()
        setIsSubmitting(false)
    }

    return (
        <Form onSubmit={handleSubmit}>
            <Box height={{ min: '50vh' }} justify="between">
                <Box height={{ min: 'auto' }} pad="xsmall">
                    {proposalInput.flexInputs.map((flexInput, idx) => {
                        const type = getFlexInputType(
                            composition.solvers,
                            flexInput
                        )
                        return (
                            <Box key={idx}>
                                <FormField
                                    label={flexInput.label}
                                    type={type}
                                    value={flexInput.value}
                                    onChange={(e) => {
                                        const inputsClone =
                                            _.cloneDeep(proposalInput)

                                        inputsClone.flexInputs[idx].value =
                                            e.target.value

                                        setProposalInput(inputsClone)
                                    }}
                                    validate={[
                                        () =>
                                            isRequired(
                                                proposalInput.flexInputs[idx]
                                                    .value
                                            ),
                                        () => {
                                            if (
                                                type === 'address' &&
                                                !isAddress(
                                                    proposalInput.flexInputs[
                                                        idx
                                                    ].value
                                                )
                                            ) {
                                                return 'Invalid Address'
                                            }
                                        },
                                    ]}
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

export default ProposalFlexInputsForm
