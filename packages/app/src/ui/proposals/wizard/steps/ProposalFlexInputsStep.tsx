import {
    PROPOSAL_WIZARD_STEPS,
    ProposalWizardStepsType,
} from '../ProposalWizard'

import { Box } from 'grommet'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import ProposalFlexInputsForm from '../../forms/ProposalFlexInputsForm'

interface ProposalFlexInputsStepProps {
    stepperCallback: (step: ProposalWizardStepsType) => void
}

const ProposalFlexInputsStep = ({
    stepperCallback,
}: ProposalFlexInputsStepProps) => (
    <Box height={{ min: '60vh' }}>
        <Box gap="medium">
            <HeaderTextSection
                title="Reasonable. Just a few more details"
                paragraph="Please input the following information to set up the Solver correctly."
            />
            <ProposalFlexInputsForm
                postRollSubmit={() => {
                    stepperCallback(PROPOSAL_WIZARD_STEPS.PUBLISH)
                }}
                submitLabel="Save & Continue"
                postRollCancel={() =>
                    stepperCallback(PROPOSAL_WIZARD_STEPS.PRICING)
                }
                cancelLabel="Dismiss & Back"
            />
        </Box>
    </Box>
)

export default ProposalFlexInputsStep
