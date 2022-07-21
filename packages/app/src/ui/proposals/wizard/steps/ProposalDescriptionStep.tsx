import {
    PROPOSAL_WIZARD_STEPS,
    ProposalWizardStepsType,
} from '../ProposalWizard'

import { Box } from 'grommet'
import { CeramicProposalModel } from '@cambrian/app/models/ProposalModel'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import ProposalDescriptionForm from '../../forms/ProposalDescriptionForm'
import { SetStateAction } from 'react'
import router from 'next/router'

interface ProposalDescriptionStepProps {
    stepperCallback: (step: ProposalWizardStepsType) => void
    proposalInput: CeramicProposalModel
    setProposalInput: React.Dispatch<
        SetStateAction<CeramicProposalModel | undefined>
    >
    onSaveProposal: () => Promise<void>
}

const ProposalDescriptionStep = ({
    proposalInput,
    setProposalInput,
    onSaveProposal,
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
            proposalInput={proposalInput}
            setProposalInput={setProposalInput}
            onSubmit={async () => {
                await onSaveProposal()
                stepperCallback(PROPOSAL_WIZARD_STEPS.PRICING)
            }}
            submitLabel="Save & Continue"
            onCancel={() =>
                router.push(`${window.location.origin}/dashboard/proposals`)
            }
            cancelLabel="Cancel"
        />
    </Box>
)

export default ProposalDescriptionStep
