import { Box, Button, Form, FormField, TextArea, TextInput } from 'grommet'
import React, { SetStateAction, useEffect, useState } from 'react'

import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import { ProposalModel } from '@cambrian/app/models/ProposalModel'
import TwoButtonWrapContainer from '@cambrian/app/components/containers/TwoButtonWrapContainer'
import { isRequired } from '@cambrian/app/utils/helpers/validation'
import useEditProposal, {
    EditProposalContextType,
} from '@cambrian/app/hooks/useEditProposal'
import BaseSkeletonBox from '@cambrian/app/components/skeletons/BaseSkeletonBox'

interface ProposalDescriptionFormProps {
    editProposalContext: EditProposalContextType
    onSubmit?: () => Promise<void>
    onCancel?: () => void
    submitLabel?: string
    cancelLabel?: string
}

const ProposalDescriptionForm = ({
    editProposalContext,
    onSubmit,
    onCancel,
    submitLabel,
    cancelLabel,
}: ProposalDescriptionFormProps) => {
    const { proposal, setProposal, onSaveProposal, onResetProposal } =
        editProposalContext
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async () => {
        setIsSubmitting(true)
        onSubmit ? await onSubmit() : await onSaveProposal()
        setIsSubmitting(false)
    }

    if (!proposal) {
        return (
            <Box height="large" gap="medium">
                <BaseSkeletonBox height={'xxsmall'} width={'100%'} />
                <BaseSkeletonBox height={'small'} width={'100%'} />
            </Box>
        )
    }
    return (
        <Form onSubmit={handleSubmit}>
            <Box justify="between" height={{ min: '50vh' }}>
                <Box height={{ min: 'auto' }} pad="xsmall">
                    <FormField
                        name="title"
                        label="Title"
                        validate={[() => isRequired(proposal.title)]}
                    >
                        <TextInput
                            placeholder={'Type your proposal title here...'}
                            value={proposal.title}
                            onChange={(e) => {
                                setProposal({
                                    ...proposal,
                                    title: e.target.value,
                                })
                            }}
                        />
                    </FormField>
                    <FormField
                        name="description"
                        label="Description"
                        validate={[() => isRequired(proposal.description)]}
                    >
                        <TextArea
                            placeholder={
                                'Type your proposal desciption here...'
                            }
                            rows={15}
                            resize={false}
                            value={proposal.description}
                            onChange={(e) =>
                                setProposal({
                                    ...proposal,
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
                            onClick={onCancel ? onCancel : onResetProposal}
                        />
                    }
                />
            </Box>
        </Form>
    )
}

export default ProposalDescriptionForm
