import { Box, Button, Form, FormField, Text } from 'grommet'
import React, { useEffect, useState } from 'react'

import { FlexInputFormType } from '../../templates/forms/TemplateFlexInputsForm'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import _ from 'lodash'
import { getFlexInputType } from '@cambrian/app/utils/helpers/flexInputHelpers'
import { useProposal } from '@cambrian/app/hooks/useProposal'

interface ProposalFlexInputsFormProps {
    postRollSubmit?: () => void
    submitLabel?: string
    postRollCancel?: () => void
    cancelLabel?: string
}

// TODO Validation
const ProposalFlexInputsForm = ({
    postRollSubmit,
    submitLabel,
    postRollCancel,
    cancelLabel,
}: ProposalFlexInputsFormProps) => {
    const {
        proposalInput,
        proposalStack,
        setProposalInput,
        onResetProposalInput,
        onSaveProposal,
    } = useProposal()

    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        return () => {}
    }, [])

    const handleSubmit = async () => {
        setIsSubmitting(true)
        await onSaveProposal()
        postRollSubmit && postRollSubmit()
        setIsSubmitting(false)
    }

    return (
        <Form<FlexInputFormType[]> onSubmit={handleSubmit}>
            <Box height="50vh" justify="between">
                <Box height={{ min: 'auto' }}>
                    {proposalInput &&
                        proposalStack &&
                        proposalInput.flexInputs.map((flexInput, idx) => {
                            const type = getFlexInputType(
                                proposalStack.composition.solvers,
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
                <Box direction="row" justify="between" height={{ min: 'auto' }}>
                    <Button
                        size="small"
                        secondary
                        label={cancelLabel || 'Reset all changes'}
                        onClick={() => {
                            onResetProposalInput()
                            postRollCancel && postRollCancel()
                        }}
                    />
                    <LoaderButton
                        isLoading={isSubmitting}
                        size="small"
                        primary
                        label={submitLabel || 'Save'}
                        type="submit"
                    />
                </Box>
            </Box>
        </Form>
    )
}

export default ProposalFlexInputsForm
