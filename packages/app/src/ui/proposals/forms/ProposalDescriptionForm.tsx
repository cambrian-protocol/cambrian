import { Box, Button, Form, FormField, TextArea } from 'grommet'
import React, { useEffect, useState } from 'react'

import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import { useProposal } from '@cambrian/app/hooks/useProposal'

interface ProposalDescriptionFormProps {
    postRollSubmit?: () => void
    submitLabel?: string
    postRollCancel?: () => void
    cancelLabel?: string
}

type ProposalDescriptionFormType = {
    title: string
    description: string
}

// TODO Validation
const ProposalDescriptionForm = ({
    postRollSubmit,
    submitLabel,
    postRollCancel,
    cancelLabel,
}: ProposalDescriptionFormProps) => {
    const {
        proposalInput,
        setProposalInput,
        onSaveProposal,
        onResetProposalInput,
    } = useProposal()

    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        return () => {}
    }, [])

    const handleSubmit = async () => {
        setIsSubmitting(true)
        onSaveProposal && (await onSaveProposal())
        postRollSubmit && postRollSubmit()
        setIsSubmitting(false)
    }
    return (
        <>
            {proposalInput && (
                <Form<ProposalDescriptionFormType> onSubmit={handleSubmit}>
                    <Box height="50vh" justify="between">
                        <Box height={{ min: 'auto' }}>
                            <FormField
                                label="Title"
                                placeholder={'Type your proposal title here...'}
                                value={proposalInput.title}
                                onChange={(e) => {
                                    setProposalInput({
                                        ...proposalInput,
                                        title: e.target.value,
                                    })
                                }}
                            />
                            <FormField label="Description">
                                <TextArea
                                    placeholder={
                                        'Type your proposal desciption here...'
                                    }
                                    rows={15}
                                    resize={false}
                                    value={proposalInput.description}
                                    onChange={(e) =>
                                        setProposalInput({
                                            ...proposalInput,
                                            description: e.target.value,
                                        })
                                    }
                                />
                            </FormField>
                        </Box>
                        <Box
                            direction="row"
                            justify="between"
                            pad={{ top: 'medium' }}
                            height={{ min: 'auto' }}
                        >
                            <Button
                                size="small"
                                secondary
                                label={cancelLabel || 'Reset all changes'}
                                onClick={() => {
                                    onResetProposalInput &&
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
            )}
        </>
    )
}

export default ProposalDescriptionForm
