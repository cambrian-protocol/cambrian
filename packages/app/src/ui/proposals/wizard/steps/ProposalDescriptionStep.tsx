import {
    PROPOSAL_WIZARD_STEPS,
    ProposalWizardStepsType,
} from '../ProposalWizard'

import { Box } from 'grommet'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import ProposalDescriptionForm from '../../forms/ProposalDescriptionForm'
import router from 'next/router'

interface ProposalDescriptionStepProps {
    stepperCallback: (step: ProposalWizardStepsType) => void
}

const ProposalDescriptionStep = ({
    stepperCallback,
}: ProposalDescriptionStepProps) => (
    <Box height={{ min: '60vh' }}>
        <HeaderTextSection
            title={`Provide us with details about the project`}
            paragraph={
                'Please be sure to include information requested by the Template description.'
            }
        />
        <ProposalDescriptionForm
            postRollSubmit={() => {
                stepperCallback(PROPOSAL_WIZARD_STEPS.PRICING)
            }}
            submitLabel="Save & Continue"
            postRollCancel={() =>
                router.push(`${window.location.origin}/dashboard/proposals`)
            }
            cancelLabel="Cancel"
        />
    </Box>
)

export default ProposalDescriptionStep
