import { Box, Button, Form } from 'grommet'
import {
    PROPOSAL_WIZARD_STEPS,
    ProposalWizardStepsType,
} from '../ProposalWizard'
import { SetStateAction, useState } from 'react'

import BaseSkeletonBox from '@cambrian/app/components/skeletons/BaseSkeletonBox'
import ButtonRowContainer from '@cambrian/app/components/containers/ButtonRowContainer'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import ProposalFlexInputsForm from '../../forms/ProposalFlexInputsForm'
import { ProposalInputType } from '../../EditProposalUI'
import _ from 'lodash'
import { useProposalContext } from '@cambrian/app/hooks/useProposalContext'

interface ProposalFlexInputsStepProps {
    proposalInput: ProposalInputType
    setProposalInput: React.Dispatch<SetStateAction<ProposalInputType>>
    stepperCallback: (step: ProposalWizardStepsType) => void
}

const ProposalFlexInputsStep = ({
    proposalInput,
    setProposalInput,
    stepperCallback,
}: ProposalFlexInputsStepProps) => {
    const { proposal } = useProposalContext()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const onSave = async () => {
        if (proposal) {
            try {
                setIsSubmitting(true)
                const updatedProposal = {
                    ...proposal.content,
                    flexInputs: proposalInput.flexInputs,
                }
                if (!_.isEqual(updatedProposal, proposal.content)) {
                    await proposal.updateContent(updatedProposal)
                }
                stepperCallback(PROPOSAL_WIZARD_STEPS.PUBLISH)
                setIsSubmitting(false)
            } catch (e) {
                console.error(e)
            }
        }
    }

    return (
        <Box>
            <HeaderTextSection
                title="Reasonable. Just a few more details"
                paragraph="Please input the following information to set up the Solver correctly."
            />
            {proposal ? (
                <Form onSubmit={onSave}>
                    <ProposalFlexInputsForm
                        proposal={proposal}
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
                                label={'Back'}
                                onClick={() => {
                                    stepperCallback(
                                        PROPOSAL_WIZARD_STEPS.PRICING
                                    )
                                }}
                            />
                        }
                    />
                </Form>
            ) : (
                <Box height="medium" gap="medium">
                    <BaseSkeletonBox height={'xxsmall'} width={'100%'} />
                    <BaseSkeletonBox height={'xxsmall'} width={'100%'} />
                </Box>
            )}
        </Box>
    )
}

export default ProposalFlexInputsStep
