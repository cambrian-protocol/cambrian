import {
    PROPOSAL_WIZARD_STEPS,
    ProposalWizardStepsType,
} from '../ProposalWizard'

import { Box } from 'grommet'
import { CeramicProposalModel } from '@cambrian/app/models/ProposalModel'
import { CeramicTemplateModel } from '@cambrian/app/models/TemplateModel'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import ProposalPricingForm from '../../forms/ProposalPricingForm'
import { SetStateAction } from 'react'

interface ProposalPricingStepProps {
    stepperCallback: (step: ProposalWizardStepsType) => void
    proposalInput: CeramicProposalModel
    setProposalInput: React.Dispatch<
        SetStateAction<CeramicProposalModel | undefined>
    >
    onSaveProposal: () => Promise<void>
    template: CeramicTemplateModel
}

const ProposalPricingStep = ({
    template,
    stepperCallback,
    onSaveProposal,
    proposalInput,
    setProposalInput,
}: ProposalPricingStepProps) => {
    return (
        <Box height={{ min: '60vh' }}>
            <Box gap="medium">
                <HeaderTextSection title="Great! And how much are you willing to pay?" />
                <ProposalPricingForm
                    template={template}
                    proposalInput={proposalInput}
                    setProposalInput={setProposalInput}
                    onSubmit={async () => {
                        await onSaveProposal()
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
                    onCancel={() =>
                        stepperCallback(PROPOSAL_WIZARD_STEPS.DESCRIPTION)
                    }
                    cancelLabel="Back"
                />
            </Box>
        </Box>
    )
}

export default ProposalPricingStep
