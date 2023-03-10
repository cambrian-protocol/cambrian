import {
    Box,
    Button,
    Form,
    FormExtendedEvent,
    FormField,
    TextArea,
    TextInput,
} from 'grommet'
import React, { useState } from 'react'

import ButtonRowContainer from '@cambrian/app/components/containers/ButtonRowContainer'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import Proposal from '@cambrian/app/classes/stages/Proposal'
import _ from 'lodash'
import { isRequired } from '@cambrian/app/utils/helpers/validation'

export type ProposalDescriptionFormType = {
    title: string
    description: string
}
interface ProposalDescriptionFormProps {
    proposal: Proposal
    onSubmit?: () => void
    onCancel?: () => void
    submitLabel?: string
    cancelLabel?: string
}

const ProposalDescriptionForm = ({
    proposal,
    onSubmit,
    onCancel,
    submitLabel,
    cancelLabel,
}: ProposalDescriptionFormProps) => {
    const [title, setTitle] = useState(proposal.content.title)
    const [description, setDescription] = useState(proposal.content.description)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (
        event: FormExtendedEvent<ProposalDescriptionFormType, Element>
    ) => {
        try {
            event.preventDefault()
            setIsSubmitting(true)
            const updatedProposal = {
                ...proposal.content,
                title: title,
                description: description,
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
        setTitle(proposal.content.title)
        setDescription(proposal.content.description)
    }

    return (
        <Form onSubmit={handleSubmit}>
            <Box gap="medium">
                <Box>
                    <FormField
                        name="title"
                        label="Title"
                        validate={[() => isRequired(title)]}
                    >
                        <TextInput
                            placeholder={'Type your proposal title here...'}
                            value={title}
                            onChange={(e) => {
                                setTitle(e.target.value)
                            }}
                        />
                    </FormField>
                    <FormField
                        name="description"
                        label="Description"
                        validate={[() => isRequired(description)]}
                    >
                        <TextArea
                            placeholder={
                                'Type your proposal desciption here...'
                            }
                            rows={15}
                            resize={false}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </FormField>
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

export default ProposalDescriptionForm
