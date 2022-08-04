import { Box, Button, Form, FormField, TextArea } from 'grommet'
import React, { SetStateAction, useEffect, useState } from 'react'

import { CeramicProposalModel } from '@cambrian/app/models/ProposalModel'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import TwoButtonWrapContainer from '@cambrian/app/components/containers/TwoButtonWrapContainer'
import { isRequired } from '@cambrian/app/utils/helpers/validation'

interface ProposalDescriptionFormProps {
    proposalInput: CeramicProposalModel
    setProposalInput: React.Dispatch<
        SetStateAction<CeramicProposalModel | undefined>
    >
    onSubmit: () => Promise<void>
    submitLabel?: string
    onCancel?: () => void
    cancelLabel?: string
}

const ProposalDescriptionForm = ({
    proposalInput,
    setProposalInput,
    onSubmit,
    submitLabel,
    onCancel,
    cancelLabel,
}: ProposalDescriptionFormProps) => {
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
            <Box justify="between" height={{ min: '50vh' }}>
                <Box height={{ min: 'auto' }} pad="xsmall">
                    <FormField
                        name="title"
                        label="Title"
                        placeholder={'Type your proposal title here...'}
                        value={proposalInput.title}
                        onChange={(e) => {
                            setProposalInput({
                                ...proposalInput,
                                title: e.target.value,
                            })
                        }}
                        validate={[() => isRequired(proposalInput.title)]}
                    />
                    <FormField
                        name="description"
                        label="Description"
                        validate={[() => isRequired(proposalInput.description)]}
                    >
                        <TextArea
                            name="description"
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

export default ProposalDescriptionForm
