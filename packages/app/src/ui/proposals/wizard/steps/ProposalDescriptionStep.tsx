import { Box, Button, Form, Heading, Text } from 'grommet'
import {
    PROPOSAL_WIZARD_STEPS,
    ProposalWizardStepsType,
} from '../ProposalWizard'
import { SetStateAction, useState } from 'react'

import BaseSkeletonBox from '@cambrian/app/components/skeletons/BaseSkeletonBox'
import ButtonRowContainer from '@cambrian/app/components/containers/ButtonRowContainer'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import ProposalDescriptionForm from '../../forms/ProposalDescriptionForm'
import { ProposalInputType } from '../../EditProposalUI'
import _ from 'lodash'
import { useProposalContext } from '@cambrian/app/hooks/useProposalContext'
import { useRouter } from 'next/router'

interface ProposalDescriptionStepProps {
    proposalInput: ProposalInputType
    setProposalInput: React.Dispatch<SetStateAction<ProposalInputType>>
    stepperCallback: (step: ProposalWizardStepsType) => void
}

const ProposalDescriptionStep = ({
    proposalInput,
    setProposalInput,
    stepperCallback,
}: ProposalDescriptionStepProps) => {
    const router = useRouter()
    const { proposal } = useProposalContext()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const onSave = async () => {
        if (proposal) {
            try {
                setIsSubmitting(true)
                const updatedProposal = {
                    ...proposal.content,
                    title: proposalInput.title,
                    description: proposalInput.description,
                }
                if (!_.isEqual(updatedProposal, proposal.content)) {
                    await proposal.updateContent(updatedProposal)
                }
                stepperCallback(PROPOSAL_WIZARD_STEPS.PRICING)
                setIsSubmitting(false)
            } catch (e) {
                console.error(e)
            }
        }
    }

    return (
        <Box>
            <HeaderTextSection
                title={`Provide us with details about the project`}
                paragraph={
                    'Please be sure to include information requested by the Template description.'
                }
            />
            {proposal ? (
                <Form onSubmit={onSave}>
                    {proposal.templateCommitDoc.content.requirements !== '' && (
                        <Box gap="xsmall">
                            <Heading level="4">Requirements</Heading>
                            <Text
                                color="dark-4"
                                style={{ whiteSpace: 'pre-line' }}
                            >
                                {
                                    proposal.templateCommitDoc.content
                                        .requirements
                                }
                            </Text>
                        </Box>
                    )}
                    <ProposalDescriptionForm
                        proposalInput={proposalInput}
                        setProposalInput={setProposalInput}
                    />
                    <ButtonRowContainer
                        primaryButton={
                            <LoaderButton
                                isLoading={isSubmitting}
                                size="small"
                                primary
                                label={'Continue'}
                                type="submit"
                            />
                        }
                        secondaryButton={
                            <Button
                                size="small"
                                secondary
                                label={'Cancel'}
                                onClick={() => {
                                    router.push(
                                        `${window.location.origin}/dashboard?idx=2`
                                    )
                                }}
                            />
                        }
                    />
                </Form>
            ) : (
                <Box height="large" gap="medium">
                    <BaseSkeletonBox height={'xxsmall'} width={'100%'} />
                    <BaseSkeletonBox height={'small'} width={'100%'} />
                </Box>
            )}
        </Box>
    )
}

export default ProposalDescriptionStep
