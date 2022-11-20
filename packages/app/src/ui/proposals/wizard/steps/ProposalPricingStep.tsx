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
import useEditProposal from '@cambrian/app/hooks/useEditProposal'

interface ProposalPricingStepProps {
    stepperCallback: (step: ProposalWizardStepsType) => void
}

const ProposalPricingStep = ({ stepperCallback }: ProposalPricingStepProps) => {
    const { proposal, onSaveProposal } = useEditProposal()
    return (
        <Box>
            <Box pad="xsmall">
                <HeaderTextSection title="Great! And how much are you willing to pay?" />
            </Box>
            <ProposalPricingForm
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
