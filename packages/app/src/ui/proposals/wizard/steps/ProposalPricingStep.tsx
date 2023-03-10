import {
    PROPOSAL_WIZARD_STEPS,
    ProposalWizardStepsType,
} from '../ProposalWizard'

import BaseSkeletonBox from '@cambrian/app/components/skeletons/BaseSkeletonBox'
import { Box } from 'grommet'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import ProposalPricingForm from '../../forms/ProposalPricingForm'
import { useProposalContext } from '@cambrian/app/hooks/useProposalContext'

interface ProposalPricingStepProps {
    stepperCallback: (step: ProposalWizardStepsType) => void
}

const ProposalPricingStep = ({ stepperCallback }: ProposalPricingStepProps) => {
    const { proposal } = useProposalContext()

    return (
        <Box>
            <HeaderTextSection title="Great! And how much are you willing to pay?" />
            {proposal ? (
                <ProposalPricingForm
                    proposal={proposal}
                    onSubmit={() => {
                        if (
                            proposal &&
                            proposal.content.flexInputs.length > 0
                        ) {
                            stepperCallback(PROPOSAL_WIZARD_STEPS.FLEX_INPUTS)
                        } else {
                            stepperCallback(PROPOSAL_WIZARD_STEPS.PUBLISH)
                        }
                    }}
                    submitLabel="Save & Continue"
                    onCancel={() =>
                        stepperCallback(PROPOSAL_WIZARD_STEPS.DESCRIPTION)
                    }
                    cancelLabel="Back"
                />
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
