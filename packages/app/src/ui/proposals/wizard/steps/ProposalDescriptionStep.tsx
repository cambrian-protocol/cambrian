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
import useEditProposal from '@cambrian/app/hooks/useEditProposal'

interface ProposalDescriptionStepProps {
    stepperCallback: (step: ProposalWizardStepsType) => void
}

const ProposalDescriptionStep = ({
    stepperCallback,
}: ProposalDescriptionStepProps) => {
    const { onSaveProposal, stageStack } = useEditProposal()

    return (
        <Box gap="medium">
            <Box pad="xsmall">
                <HeaderTextSection
                    title={`Provide us with details about the project`}
                    paragraph={
                        'Please be sure to include information requested by the Template description.'
                    }
                />
                {stageStack?.template.requirements.trim() !== '' && (
                    <Box gap="xsmall">
                        <Heading level="4">Requirements</Heading>
                        <Text color="dark-4" style={{ whiteSpace: 'pre-line' }}>
                            {stageStack?.template.requirements}
                        </Text>
                    </Box>
                )}
            </Box>
            <ProposalDescriptionForm
                onSubmit={async () => {
                    if (await onSaveProposal())
                        stepperCallback(PROPOSAL_WIZARD_STEPS.PRICING)
                }}
                submitLabel="Save & Continue"
                onCancel={() =>
                    router.push(`${window.location.origin}/dashboard?idx=2`)
                }
                cancelLabel="Cancel"
            />
        </Box>
    )
}

export default ProposalDescriptionStep
