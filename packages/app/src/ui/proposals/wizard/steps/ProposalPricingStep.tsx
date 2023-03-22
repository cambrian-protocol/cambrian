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
import { ProposalInputType } from '../../EditProposalUI'
import ProposalPricingForm from '../../forms/ProposalPricingForm'
import _ from 'lodash'
import { useProposalContext } from '@cambrian/app/hooks/useProposalContext'

interface ProposalPricingStepProps {
    proposalInput: ProposalInputType
    setProposalInput: React.Dispatch<SetStateAction<ProposalInputType>>
    stepperCallback: (step: ProposalWizardStepsType) => void
}

const ProposalPricingStep = ({
    proposalInput,
    setProposalInput,
    stepperCallback,
}: ProposalPricingStepProps) => {
    const { proposal } = useProposalContext()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const onSave = async () => {
        if (proposal) {
            try {
                setIsSubmitting(true)
                const updatedProposal = {
                    ...proposal.content,
                    price: proposalInput.price,
                }
                if (!_.isEqual(updatedProposal, proposal.content)) {
                    await proposal.updateContent(updatedProposal)
                }

                if (proposal && proposal.content.flexInputs.length > 0) {
                    stepperCallback(PROPOSAL_WIZARD_STEPS.FLEX_INPUTS)
                } else {
                    stepperCallback(PROPOSAL_WIZARD_STEPS.PUBLISH)
                }
                setIsSubmitting(false)
            } catch (e) {
                console.error(e)
            }
        }
    }

    return (
        <Box>
            <HeaderTextSection title="Great! And how much are you willing to pay?" />
            {proposal ? (
                <Form onSubmit={onSave}>
                    <ProposalPricingForm
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
                                        PROPOSAL_WIZARD_STEPS.DESCRIPTION
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

export default ProposalPricingStep
