import { Box, Button, Form, FormField, TextArea } from 'grommet'
import React, { SetStateAction, useEffect, useState } from 'react'

import { CeramicProposalModel } from '@cambrian/app/models/ProposalModel'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'

interface ProposalDescriptionFormProps {
    proposalInput: CeramicProposalModel
    setProposalInput: React.Dispatch<
        SetStateAction<CeramicProposalModel | undefined>
    >
    onSubmit: () => Promise<void>
    submitLabel?: string
    onCancel: () => void
    cancelLabel?: string
}

type ProposalDescriptionFormType = {
    title: string
    description: string
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
        <Form<ProposalDescriptionFormType> onSubmit={handleSubmit}>
            <Box height="50vh" justify="between">
                <Box>
                    <FormField
                        name="title"
                        label="Title"
                        required
                        placeholder={'Type your proposal title here...'}
                        value={proposalInput.title}
                        onChange={(e) =>
                            setProposalInput({
                                ...proposalInput,
                                title: e.target.value,
                            })
                        }
                    />
                    <FormField name="description" label="Description" required>
                        <TextArea
                            name="description"
                            placeholder={
                                'Type your proposal desciption here...'
                            }
                            rows={9}
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
                <Box direction="row" justify="between" pad={{ top: 'medium' }}>
                    <Button
                        size="small"
                        secondary
                        label={cancelLabel || 'Reset all changes'}
                        onClick={onCancel}
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

export default ProposalDescriptionForm
