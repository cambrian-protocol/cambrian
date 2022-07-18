import {
    PROPOSAL_WIZARD_STEPS,
    ProposalWizardStepsType,
} from '../ProposalWizard'

import { Box } from 'grommet'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import ProposalPricingForm from '../../forms/ProposalPricingForm'
import { useProposal } from '@cambrian/app/hooks/useProposal'

interface ProposalPricingStepProps {
    stepperCallback: (step: ProposalWizardStepsType) => void
}

const ProposalPricingStep = ({ stepperCallback }: ProposalPricingStepProps) => {
    const { proposalInput } = useProposal()

    return (
        <Box height={{ min: '60vh' }}>
            <Box gap="medium">
                <HeaderTextSection title="Great! And how much are you willing to pay?" />
                <ProposalPricingForm
                    postRollSubmit={async () => {
                        if (
                            proposalInput &&
                            proposalInput.flexInputs.length > 0
                        ) {
                            stepperCallback(PROPOSAL_WIZARD_STEPS.FLEX_INPUTS)
                        } else {
                            stepperCallback(PROPOSAL_WIZARD_STEPS.PUBLISH)
                        }
                    }}
                    submitLabel="Save & Continue"
                    postRollCancel={() =>
                        stepperCallback(PROPOSAL_WIZARD_STEPS.DESCRIPTION)
                    }
                    cancelLabel="Dismiss & Back"
                />
            </Box>
        </Box>
    )
}

export default ProposalPricingStep
