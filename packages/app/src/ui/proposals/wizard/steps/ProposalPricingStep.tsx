import {
    PROPOSAL_WIZARD_STEPS,
    ProposalWizardStepsType,
} from '../ProposalWizard'

import { Box } from 'grommet'
import { EditProposalType } from '@cambrian/app/hooks/useEditProposal'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import ProposalPricingForm from '../../forms/ProposalPricingForm'

interface ProposalPricingStepProps {
    editProposalProps: EditProposalType
    stepperCallback: (step: ProposalWizardStepsType) => void
}

const ProposalPricingStep = ({
    editProposalProps,
    stepperCallback,
}: ProposalPricingStepProps) => {
    const { proposal, onSaveProposal } = editProposalProps
    return (
        <Box>
            <Box pad="xsmall">
                <HeaderTextSection title="Great! And how much are you willing to pay?" />
            </Box>
            <ProposalPricingForm
                editProposalProps={editProposalProps}
                onSubmit={async () => {
                    if (await onSaveProposal()) {
                        if (proposal && proposal.flexInputs.length > 0) {
                            stepperCallback(PROPOSAL_WIZARD_STEPS.FLEX_INPUTS)
                        } else {
                            stepperCallback(PROPOSAL_WIZARD_STEPS.PUBLISH)
                        }
                    }
                }}
                submitLabel="Save & Continue"
                onCancel={() =>
                    stepperCallback(PROPOSAL_WIZARD_STEPS.DESCRIPTION)
                }
                cancelLabel="Back"
            />
        </Box>
    )
}

export default ProposalPricingStep
