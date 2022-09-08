import { Box, Heading, Text } from 'grommet'
import {
    PROPOSAL_WIZARD_STEPS,
    ProposalWizardStepsType,
} from '../ProposalWizard'

import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import ProposalDescriptionForm from '../../forms/ProposalDescriptionForm'
import { ProposalModel } from '@cambrian/app/models/ProposalModel'
import { SetStateAction } from 'react'
import router from 'next/router'

interface ProposalDescriptionStepProps {
    stepperCallback: (step: ProposalWizardStepsType) => void
    proposalInput: ProposalModel
    setProposalInput: React.Dispatch<SetStateAction<ProposalModel | undefined>>
    onSaveProposal: () => Promise<boolean>
    requirements: string
}

const ProposalDescriptionStep = ({
    proposalInput,
    setProposalInput,
    onSaveProposal,
    stepperCallback,
    requirements,
}: ProposalDescriptionStepProps) => (
    <Box gap="medium">
        <Box pad="xsmall">
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
        </Box>
        <ProposalDescriptionForm
            proposalInput={proposalInput}
            setProposalInput={setProposalInput}
            onSubmit={async () => {
                if (await onSaveProposal())
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
