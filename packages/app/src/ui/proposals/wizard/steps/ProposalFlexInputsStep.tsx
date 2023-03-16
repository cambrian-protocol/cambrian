import {
    PROPOSAL_WIZARD_STEPS,
    ProposalWizardStepsType,
} from '../ProposalWizard'

import BaseSkeletonBox from '@cambrian/app/components/skeletons/BaseSkeletonBox'
import { Box } from 'grommet'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import ProposalFlexInputsForm from '../../forms/ProposalFlexInputsForm'
import { useProposalContext } from '@cambrian/app/hooks/useProposalContext'

interface ProposalFlexInputsStepProps {
    stepperCallback: (step: ProposalWizardStepsType) => void
}

const ProposalFlexInputsStep = ({
    stepperCallback,
}: ProposalFlexInputsStepProps) => {
    const { proposal } = useProposalContext()

    return (
        <Box>
            <HeaderTextSection
                title="Reasonable. Just a few more details"
                paragraph="Please input the following information to set up the Solver correctly."
            />
            {proposal ? (
                <ProposalFlexInputsForm
                    proposal={proposal}
                    onSubmit={() =>
                        stepperCallback(PROPOSAL_WIZARD_STEPS.PUBLISH)
                    }
                    submitLabel="Save & Continue"
                    onCancel={() =>
                        stepperCallback(PROPOSAL_WIZARD_STEPS.PRICING)
                    }
                    cancelLabel="Back"
                />
            ) : (
                <Box height="medium" gap="medium">
                    <BaseSkeletonBox height={'xxsmall'} width={'100%'} />
                    <BaseSkeletonBox height={'xxsmall'} width={'100%'} />
                </Box>
            )}
        </Box>
    )
}

export default ProposalFlexInputsStep
