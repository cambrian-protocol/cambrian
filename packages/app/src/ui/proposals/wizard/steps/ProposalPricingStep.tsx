import {
    PROPOSAL_WIZARD_STEPS,
    ProposalWizardStepsType,
} from '../ProposalWizard'

import { Box } from 'grommet'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import { ProposalModel } from '@cambrian/app/models/ProposalModel'
import ProposalPricingForm from '../../forms/ProposalPricingForm'
import { SetStateAction } from 'react'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'

interface ProposalPricingStepProps {
    stepperCallback: (step: ProposalWizardStepsType) => void
    proposalInput: ProposalModel
    setProposalInput: React.Dispatch<SetStateAction<ProposalModel | undefined>>
    onSaveProposal: () => Promise<boolean>
    template: TemplateModel
}

const ProposalPricingStep = ({
    template,
    stepperCallback,
    onSaveProposal,
    proposalInput,
    setProposalInput,
}: ProposalPricingStepProps) => {
    return (
        <Box>
            <Box pad="xsmall">
                <HeaderTextSection title="Great! And how much are you willing to pay?" />
            </Box>
            <ProposalPricingForm
                template={template}
                proposalInput={proposalInput}
                setProposalInput={setProposalInput}
                onSubmit={async () => {
                    if (await onSaveProposal()) {
                        if (
                            proposalInput &&
                            proposalInput.flexInputs.length > 0
                        ) {
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
