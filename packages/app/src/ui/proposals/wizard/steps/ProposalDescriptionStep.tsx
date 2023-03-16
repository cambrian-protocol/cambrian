import { Box, Heading, Text } from 'grommet'
import {
    PROPOSAL_WIZARD_STEPS,
    ProposalWizardStepsType,
} from '../ProposalWizard'

import BaseSkeletonBox from '@cambrian/app/components/skeletons/BaseSkeletonBox'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import ProposalDescriptionForm from '../../forms/ProposalDescriptionForm'
import router from 'next/router'
import { useProposalContext } from '@cambrian/app/hooks/useProposalContext'

interface ProposalDescriptionStepProps {
    stepperCallback: (step: ProposalWizardStepsType) => void
}

const ProposalDescriptionStep = ({
    stepperCallback,
}: ProposalDescriptionStepProps) => {
    const { proposal } = useProposalContext()

    return (
        <Box>
            <HeaderTextSection
                title={`Provide us with details about the project`}
                paragraph={
                    'Please be sure to include information requested by the Template description.'
                }
            />
            {proposal ? (
                <>
                    {proposal.templateCommitDoc.content.requirements !== '' && (
                        <Box gap="xsmall">
                            <Heading level="4">Requirements</Heading>
                            <Text
                                color="dark-4"
                                style={{ whiteSpace: 'pre-line' }}
                            >
                                {
                                    proposal.templateCommitDoc.content
                                        .requirements
                                }
                            </Text>
                        </Box>
                    )}
                    <ProposalDescriptionForm
                        proposal={proposal}
                        onSubmit={() =>
                            stepperCallback(PROPOSAL_WIZARD_STEPS.PRICING)
                        }
                        submitLabel="Save & Continue"
                        onCancel={() =>
                            router.push(
                                `${window.location.origin}/dashboard?idx=2`
                            )
                        }
                        cancelLabel="Cancel"
                    />
                </>
            ) : (
                <Box height="large" gap="medium">
                    <BaseSkeletonBox height={'xxsmall'} width={'100%'} />
                    <BaseSkeletonBox height={'small'} width={'100%'} />
                </Box>
            )}
        </Box>
    )
}

export default ProposalDescriptionStep
