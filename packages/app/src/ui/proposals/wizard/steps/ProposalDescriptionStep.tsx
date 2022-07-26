import { Box, Heading, Text } from 'grommet'
import {
    PROPOSAL_WIZARD_STEPS,
    ProposalWizardStepsType,
} from '../ProposalWizard'

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
    requirements: string
}

const ProposalDescriptionStep = ({
    proposalInput,
    setProposalInput,
    onSaveProposal,
    stepperCallback,
    requirements,
}: ProposalDescriptionStepProps) => (
    <Box height={{ min: '60vh' }} gap="medium">
        <HeaderTextSection
            title={`Provide us with details about the project`}
            paragraph={
                'Please be sure to include information requested by the Template description.'
            }
        />
        {requirements.trim() !== '' && (
            <Box gap="xsmall">
                <Heading level="4">Requirements</Heading>
                <Text color="dark-4" style={{ whiteSpace: 'pre-line' }}>
                    {requirements}
                </Text>
            </Box>
        )}
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
